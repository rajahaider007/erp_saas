<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Sales\Quotation;
use App\Models\Sales\QuotationLine;
use App\Models\Sales\Customer;
use App\Models\InventoryItem;
use App\Models\Currency;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuotationController extends Controller
{
    /**
     * Display a listing of quotations
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $comp_id = $user->comp_id;

        $query = Quotation::with('customer')->where('comp_id', $comp_id);

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('quotation_no', 'like', "%$search%");
        }

        if ($request->filled('state')) {
            $query->where('state', $request->input('state'));
        }

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->input('customer_id'));
        }

        $quotations = $query->orderBy('quotation_date', 'desc')->paginate(20);

        $states = ['draft', 'sent', 'confirmed', 'cancelled', 'expired'];
        $customers = Customer::where('comp_id', $comp_id)->get();

        return Inertia::render('Sales/Quotation/Index', [
            'quotations' => $quotations,
            'states' => $states,
            'customers' => $customers,
            'filters' => [
                'search' => $request->input('search'),
                'state' => $request->input('state'),
                'customer_id' => $request->input('customer_id'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new quotation
     */
    public function create()
    {
        $user = auth()->user();
        $comp_id = $user->comp_id;

        $customers = Customer::where('comp_id', $comp_id)
            ->where('active_status', true)
            ->get();
        $products = InventoryItem::where('status', 'active')->get();
        $currencies = Currency::all();

        return Inertia::render('Sales/Quotation/Form', [
            'isCreate' => true,
            'customers' => $customers,
            'products' => $products,
            'currencies' => $currencies,
        ]);
    }

    /**
     * Store a newly created quotation
     */
    public function store(Request $request)
    {
        $user = auth()->user();
        
        $validated = $request->validate([
            'customer_id' => 'required|exists:sales_customers,id',
            'quotation_date' => 'required|date',
            'expiry_date' => 'nullable|date',
            'currency_id' => 'required|exists:currencies,id',
            'exchange_rate' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'line_items' => 'nullable|array',
            'line_items.*.product_id' => 'nullable|numeric',
            'line_items.*.quantity' => 'nullable|numeric|min:0',
            'line_items.*.unit_price' => 'nullable|numeric|min:0',
        ]);

        $quotation = Quotation::create([
            'comp_id' => $user->comp_id,
            'location_id' => $user->location_id,
            'quotation_no' => 'QT-' . time(),
            'state' => 'draft',
            'customer_id' => $validated['customer_id'],
            'quotation_date' => $validated['quotation_date'],
            'expiry_date' => $validated['expiry_date'],
            'currency_id' => $validated['currency_id'],
            'exchange_rate' => $validated['exchange_rate'] ?? 1,
            'description' => $validated['description'],
            'amount_untaxed' => 0,
            'amount_tax' => 0,
            'amount_total' => 0,
            'amount_total_base' => 0,
            'created_by' => $user->id,
        ]);

        // Create line items if provided
        if (!empty($validated['line_items'])) {
            foreach ($validated['line_items'] as $index => $line) {
                if ($line['quantity'] > 0 && $line['unit_price'] > 0) {
                    QuotationLine::create([
                        'quotation_id' => $quotation->id,
                        'product_id' => $line['product_id'] ?? null,
                        'product_name' => $line['product_name'] ?? 'Service',
                        'product_code' => $line['product_code'] ?? null,
                        'quantity' => $line['quantity'],
                        'unit_of_measure' => $line['unit_of_measure'] ?? 'PC',
                        'unit_price' => $line['unit_price'],
                        'discount_type' => $line['discount_type'] ?? 0,
                        'discount_amount' => $line['discount_amount'] ?? 0,
                        'line_amount_untaxed' => $line['line_amount_untaxed'] ?? 0,
                        'tax_amount' => $line['tax_amount'] ?? 0,
                        'line_amount_total' => $line['line_amount_total'] ?? 0,
                        'line_sequence' => $index + 1,
                    ]);
                }
            }
        }

        // Calculate totals
        $this->calculateQuotationTotals($quotation);

        return redirect()->route('sales.quotation.index')
            ->with('success', 'Quotation created successfully');
    }

    /**
     * Show the form for editing a quotation
     */
    public function edit(Quotation $quotation)
    {
        $quotation->load('lines.product', 'customer', 'currency');
        
        $user = auth()->user();
        $comp_id = $user->comp_id;

        $customers = Customer::where('comp_id', $comp_id)
            ->where('active_status', true)
            ->get();
        $products = InventoryItem::where('status', 'active')->get();
        $currencies = Currency::all();

        return Inertia::render('Sales/Quotation/Form', [
            'isCreate' => false,
            'quotation' => $quotation,
            'customers' => $customers,
            'products' => $products,
            'currencies' => $currencies,
        ]);
    }

    /**
     * Update the specified quotation
     */
    public function update(Request $request, Quotation $quotation)
    {
        if ($quotation->state !== 'draft') {
            return back()->with('error', 'Only draft quotations can be edited');
        }

        $user = auth()->user();
        
        $validated = $request->validate([
            'customer_id' => 'required|exists:sales_customers,id',
            'quotation_date' => 'required|date',
            'expiry_date' => 'nullable|date',
            'currency_id' => 'required|exists:currencies,id',
            'exchange_rate' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'line_items' => 'nullable|array',
        ]);

        $quotation->update([
            'customer_id' => $validated['customer_id'],
            'quotation_date' => $validated['quotation_date'],
            'expiry_date' => $validated['expiry_date'],
            'currency_id' => $validated['currency_id'],
            'exchange_rate' => $validated['exchange_rate'] ?? 1,
            'description' => $validated['description'],
            'updated_by' => $user->id,
        ]);

        // Delete old lines and create new ones
        $quotation->line_items()->delete();
        
        if (!empty($validated['line_items'])) {
            foreach ($validated['line_items'] as $index => $line) {
                if ($line['quantity'] > 0 && $line['unit_price'] > 0) {
                    QuotationLine::create([
                        'quotation_id' => $quotation->id,
                        'product_id' => $line['product_id'] ?? null,
                        'product_name' => $line['product_name'] ?? 'Service',
                        'product_code' => $line['product_code'] ?? null,
                        'quantity' => $line['quantity'],
                        'unit_of_measure' => $line['unit_of_measure'] ?? 'PC',
                        'unit_price' => $line['unit_price'],
                        'discount_type' => $line['discount_type'] ?? 0,
                        'discount_amount' => $line['discount_amount'] ?? 0,
                        'line_amount_untaxed' => $line['line_amount_untaxed'] ?? 0,
                        'tax_amount' => $line['tax_amount'] ?? 0,
                        'line_amount_total' => $line['line_amount_total'] ?? 0,
                        'line_sequence' => $index + 1,
                    ]);
                }
            }
        }

        $this->calculateQuotationTotals($quotation);

        return back()->with('success', 'Quotation updated successfully');
    }

    /**
     * Calculate and update quotation totals
     */
    private function calculateQuotationTotals(Quotation $quotation)
    {
        $lines = $quotation->lines()->get();
        $amount_untaxed = $lines->sum('subtotal');
        $amount_tax = 0; // Tax calculation to be implemented
        $amount_total = $amount_untaxed + $amount_tax;

        $quotation->update([
            'amount_untaxed' => $amount_untaxed,
            'amount_tax' => $amount_tax,
            'amount_total' => $amount_total,
            'amount_total_base' => $amount_total,
        ]);
    }

    /**
     * Delete a quotation
     */
    public function destroy(Quotation $quotation)
    {
        if ($quotation->state !== 'draft') {
            return back()->with('error', 'Only draft quotations can be deleted');
        }

        $quotation->delete();

        return back()->with('success', 'Quotation deleted successfully');
    }
}
