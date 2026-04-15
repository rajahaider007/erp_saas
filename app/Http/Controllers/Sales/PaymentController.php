<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Sales\Payment;
use App\Models\Sales\PaymentAllocation;
use App\Models\Sales\Invoice;
use App\Models\Sales\Customer;
use App\Models\Currency;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    /**
     * Display a listing of payments
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $comp_id = $user->comp_id;

        $query = Payment::with('customer')->where('comp_id', $comp_id);

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('payment_reference', 'like', "%$search%");
        }

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->input('customer_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $payments = $query->orderBy('payment_date', 'desc')->paginate(20);
        $statuses = ['recorded', 'reconciled', 'cancelled'];
        $customers = Customer::where('comp_id', $comp_id)->get();

        return Inertia::render('Sales/Payment/Index', [
            'payments' => $payments,
            'statuses' => $statuses,
            'customers' => $customers,
            'filters' => [
                'search' => $request->input('search'),
                'customer_id' => $request->input('customer_id'),
                'status' => $request->input('status'),
            ],
        ]);
    }

    /**
     * Show form for registering a new payment
     */
    public function create()
    {
        $user = auth()->user();
        $comp_id = $user->comp_id;

        $customers = Customer::where('comp_id', $comp_id)
            ->where('active_status', true)
            ->get();
        $currencies = Currency::all();
        $paymentMethods = ['bank_transfer', 'cheque', 'cash', 'online'];

        return Inertia::render('Sales/Payment/Form', [
            'isCreate' => true,
            'customers' => $customers,
            'currencies' => $currencies,
            'payment_methods' => $paymentMethods,
        ]);
    }

    /**
     * Store a newly registered payment
     */
    public function store(Request $request)
    {
        $user = auth()->user();
        
        $validated = $request->validate([
            'customer_id' => 'required|exists:sales_customers,id',
            'payment_date' => 'required|date',
            'payment_method' => 'required|in:bank_transfer,cheque,cash,online',
            'amount_received' => 'required|numeric|min:0.01',
            'payment_currency_id' => 'required|exists:currencies,id',
            'bank_reference' => 'nullable|string',
            'cheque_no' => 'nullable|string',
            'cheque_date' => 'nullable|date',
            'is_advance' => 'boolean',
            'notes' => 'nullable|string',
            'allocations' => 'nullable|array',
        ]);

        $payment = Payment::create([
            'comp_id' => $user->comp_id,
            'location_id' => $user->location_id,
            'payment_reference' => 'PAY-' . time(),
            'payment_date' => $validated['payment_date'],
            'customer_id' => $validated['customer_id'],
            'payment_method' => $validated['payment_method'],
            'amount_received' => $validated['amount_received'],
            'payment_currency_id' => $validated['payment_currency_id'],
            'bank_reference' => $validated['bank_reference'] ?? null,
            'cheque_no' => $validated['cheque_no'] ?? null,
            'cheque_date' => $validated['cheque_date'] ?? null,
            'is_advance' => $validated['is_advance'] ?? false,
            'notes' => $validated['notes'] ?? null,
            'created_by' => $user->id,
            'status' => 'recorded',
        ]);

        // Create allocations if provided
        if (!empty($validated['allocations'])) {
            foreach ($validated['allocations'] as $alloc) {
                PaymentAllocation::create([
                    'payment_id' => $payment->id,
                    'invoice_id' => $alloc['invoice_id'],
                    'allocated_amount' => $alloc['amount'],
                ]);
            }
        }

        return redirect()->route('sales.payment.show', $payment->id)
            ->with('success', 'Payment registered successfully');
    }

    /**
     * Show payment details
     */
    public function show(Payment $payment)
    {
        $payment->load('allocations.invoice', 'customer', 'currency');

        return Inertia::render('Sales/Payment/Show', [
            'payment' => $payment,
        ]);
    }

    /**
     * Delete a payment
     */
    public function destroy(Payment $payment)
    {
        if ($payment->status !== 'recorded') {
            return back()->with('error', 'Only recorded payments can be deleted');
        }

        $payment->allocations()->delete();
        $payment->delete();

        return back()->with('success', 'Payment deleted successfully');
    }
}
