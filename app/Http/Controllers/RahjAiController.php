<?php

namespace App\Http\Controllers;

use App\Models\RahjAiConversation;
use App\Models\RahjAiMessage;
use App\Services\RahjAi\AssistantOrchestratorService;
use App\Services\RahjAi\GroqChatService;
use App\Services\RahjAi\RagCorpusService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Services\TranslationLoaderService;

class RahjAiController extends Controller
{
    public function history(Request $request): JsonResponse
    {
        $conversationId = (int) $request->query('conversation_id', 0);

        $conversation = $conversationId > 0
            ? $this->findConversationById($request, $conversationId)
            : $this->latestConversation($request);

        if (! $conversation) {
            return response()->json([
                'success' => true,
                'conversation_id' => null,
                'messages' => [],
            ]);
        }

        $messages = $conversation->messages()
            ->orderBy('id')
            ->limit(200)
            ->get()
            ->map(static function (RahjAiMessage $message): array {
                $meta = null;
                $action = null;
                if (is_array($message->sources)) {
                    foreach ($message->sources as $source) {
                        if (! is_array($source)) {
                            continue;
                        }
                        if (($source['source_type'] ?? null) === 'assistant_meta') {
                            $meta = is_array($source['meta'] ?? null) ? $source['meta'] : null;
                            $action = is_array($source['action'] ?? null) ? $source['action'] : null;
                            break;
                        }
                    }
                }

                return [
                    'id' => (string) $message->id,
                    'role' => $message->role,
                    'content' => $message->content,
                    'model' => $message->model,
                    'sources' => [],
                    'meta' => $meta,
                    'action' => $action,
                    'error' => (bool) $message->is_error,
                ];
            })
            ->values();

        return response()->json([
            'success' => true,
            'conversation_id' => $conversation->id,
            'messages' => $messages,
        ]);
    }

    public function conversations(Request $request): JsonResponse
    {
        $userId = $this->resolveUserId($request);
        $sessionKey = $request->session()->getId();

        if (! $userId && ! $sessionKey) {
            return response()->json([
                'success' => true,
                'conversations' => [],
            ]);
        }

        $list = RahjAiConversation::query()
            ->where(function ($query) use ($userId, $sessionKey): void {
                if ($userId) {
                    $query->orWhere('user_id', $userId);
                }
                if ($sessionKey) {
                    $query->orWhere('session_key', $sessionKey);
                }
            })
            ->withCount('messages')
            ->orderByDesc('updated_at')
            ->limit(50)
            ->get();

        $conversationIds = $list->pluck('id')->all();
        $latestByConversation = RahjAiMessage::query()
            ->whereIn('conversation_id', $conversationIds)
            ->orderByDesc('id')
            ->get()
            ->groupBy('conversation_id')
            ->map(static fn ($rows) => $rows->first());

        $items = $list->map(static function (RahjAiConversation $conversation) use ($latestByConversation): array {
            $lastMessage = $latestByConversation->get($conversation->id);
            $fallbackTitle = $lastMessage
                ? Str::limit(trim((string) $lastMessage->content), 70)
                : ('Chat #'.$conversation->id);

            return [
                'id' => $conversation->id,
                'title' => $conversation->title ?: $fallbackTitle,
                'preview' => $lastMessage ? Str::limit(trim((string) $lastMessage->content), 120) : '',
                'messages_count' => (int) $conversation->messages_count,
                'updated_at' => optional($conversation->updated_at)?->toISOString(),
            ];
        })->values();

        return response()->json([
            'success' => true,
            'conversations' => $items,
        ]);
    }

    public function clearConversation(Request $request, int $conversationId): JsonResponse
    {
        $conversation = $this->findConversationById($request, $conversationId);
        if (! $conversation) {
            return response()->json([
                'success' => false,
                'message' => 'Conversation not found.',
            ], 404);
        }

        $conversation->delete();

        return response()->json([
            'success' => true,
        ]);
    }

    public function clearAllConversations(Request $request): JsonResponse
    {
        $userId = $this->resolveUserId($request);
        $sessionKey = $request->session()->getId();

        if (! $userId && ! $sessionKey) {
            return response()->json([
                'success' => true,
                'deleted' => 0,
            ]);
        }

        $query = RahjAiConversation::query()
            ->where(function ($inner) use ($userId, $sessionKey): void {
                if ($userId) {
                    $inner->orWhere('user_id', $userId);
                }
                if ($sessionKey) {
                    $inner->orWhere('session_key', $sessionKey);
                }
            });

        $deleted = (clone $query)->count();
        $query->delete();

        return response()->json([
            'success' => true,
            'deleted' => $deleted,
        ]);
    }

    public function chat(
        Request $request,
        RagCorpusService $ragCorpus,
        GroqChatService $groq,
        AssistantOrchestratorService $orchestrator
    ): JsonResponse {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:4000'],
            'conversation_id' => ['nullable', 'integer', 'min:1'],
        ]);

        $question = trim((string) ($validated['message'] ?? ''));
        if ($question === '') {
            return response()->json([
                'success' => false,
                'message' => 'Message is required.',
            ], 422);
        }

        try {
            $conversation = $this->resolveConversation($request, $validated);

            $assistantReply = $orchestrator->respond(
                $request,
                $question,
                $ragCorpus,
                $groq,
                $conversation->id
            );

            $sources = is_array($assistantReply['sources'] ?? null)
                ? $assistantReply['sources']
                : [];
            $answer = (string) ($assistantReply['answer'] ?? '');
            $model = (string) ($assistantReply['model'] ?? 'unknown');
            $meta = is_array($assistantReply['meta'] ?? null)
                ? $assistantReply['meta']
                : [];

            RahjAiMessage::create([
                'conversation_id' => $conversation->id,
                'role' => 'user',
                'content' => $question,
            ]);

            RahjAiMessage::create([
                'conversation_id' => $conversation->id,
                'role' => 'assistant',
                'content' => $answer,
                'model' => $model,
                'sources' => $this->appendAssistantMetaToSources($sources, $meta),
                'is_error' => false,
            ]);

            if (! $conversation->title) {
                $conversation->title = Str::limit($question, 120);
                $conversation->save();
            }

            return response()->json([
                'success' => true,
                'conversation_id' => $conversation->id,
                'answer' => $answer,
                'model' => $model,
                'sources' => [],
                'meta' => $meta,
                'action' => $meta['action'] ?? null,
            ]);
        } catch (\Throwable $e) {
            $payload = [
                'message' => $e->getMessage(),
                'exception' => $e::class,
            ];
            if (config('app.debug')) {
                $payload['trace'] = Str::limit($e->getTraceAsString(), 12000);
            }
            Log::error('RAHJ AI chat failed', $payload);

            if (! empty($question)) {
                try {
                    $conversation = $this->resolveConversation($request, $validated ?? []);

                    RahjAiMessage::create([
                        'conversation_id' => $conversation->id,
                        'role' => 'user',
                        'content' => $question,
                    ]);

                    RahjAiMessage::create([
                        'conversation_id' => $conversation->id,
                        'role' => 'assistant',
                        'content' => $this->rahjChatUnavailableMessage($request),
                        'is_error' => true,
                    ]);
                } catch (\Throwable $persistError) {
                    Log::warning('RAHJ AI message persistence failed', [
                        'message' => $persistError->getMessage(),
                    ]);
                }
            }

            return response()->json([
                'success' => false,
                'message' => $this->rahjChatUnavailableMessage($request),
            ], 500);
        }
    }

    protected function rahjChatUnavailableMessage(Request $request): string
    {
        $locale = (string) $request->session()->get('locale', config('app.locale', 'en'));
        if (! in_array($locale, TranslationLoaderService::LOCALES, true)) {
            $locale = TranslationLoaderService::DEFAULT_LOCALE;
        }

        return (string) trans('rahj_ai_backend.chat_unavailable', [], $locale);
    }

    protected function resolveConversation(Request $request, array $validated): RahjAiConversation
    {
        $conversationId = (int) ($validated['conversation_id'] ?? 0);
        if ($conversationId > 0) {
            $existing = $this->findConversationById($request, $conversationId);
            if ($existing) {
                return $existing;
            }
        }

        return RahjAiConversation::create([
            'user_id' => $this->resolveUserId($request),
            'session_key' => $request->session()->getId(),
            'title' => null,
        ]);
    }

    protected function latestConversation(Request $request): ?RahjAiConversation
    {
        $userId = $this->resolveUserId($request);
        $sessionKey = $request->session()->getId();

        if (! $userId && ! $sessionKey) {
            return null;
        }

        return RahjAiConversation::query()
            ->where(function ($query) use ($userId, $sessionKey): void {
                if ($userId) {
                    $query->orWhere('user_id', $userId);
                }
                if ($sessionKey) {
                    $query->orWhere('session_key', $sessionKey);
                }
            })
            ->orderByDesc('id')
            ->first();
    }

    protected function findConversationById(Request $request, int $conversationId): ?RahjAiConversation
    {
        $userId = $this->resolveUserId($request);
        $sessionKey = $request->session()->getId();

        if (! $userId && ! $sessionKey) {
            return null;
        }

        return RahjAiConversation::query()
            ->where('id', $conversationId)
            ->where(function ($query) use ($userId, $sessionKey): void {
                if ($userId) {
                    $query->orWhere('user_id', $userId);
                }
                if ($sessionKey) {
                    $query->orWhere('session_key', $sessionKey);
                }
            })
            ->first();
    }

    protected function resolveUserId(Request $request): ?int
    {
        $authUser = $request->user();
        if ($authUser && isset($authUser->id)) {
            return (int) $authUser->id;
        }

        $sessionUserId = $request->session()->get('user_id');

        return $sessionUserId ? (int) $sessionUserId : null;
    }

    protected function appendAssistantMetaToSources(array $sources, array $meta): array
    {
        if (empty($meta)) {
            return $sources;
        }

        $cleanSources = [];
        foreach ($sources as $source) {
            if (is_array($source) && ($source['source_type'] ?? null) === 'assistant_meta') {
                continue;
            }
            $cleanSources[] = $source;
        }

        $cleanSources[] = [
            'source_type' => 'assistant_meta',
            'meta' => $meta,
            'action' => is_array($meta['action'] ?? null) ? $meta['action'] : null,
        ];

        return $cleanSources;
    }
}
