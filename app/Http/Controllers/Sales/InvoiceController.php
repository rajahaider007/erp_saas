<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Sales\Invoice;
use App\Models\Sales\InvoiceLine;
use App\Models\Sales\SalesOrder;
use App\Models\Sales\DeliveryOrder;
use App\Models\Sales\Customer;
use App\Models\InventoryItem;
use App\Models\Currency;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    /**
     * Display a listing of invoices
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $comp_id = $user->comp_id;

        $query = Invoice::with('customer')->where('comp_id', $comp_id);

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('invoice_no', 'like', "%$search%");
        }

        if ($request->filled('state')) {
            $query->where('state', $request->input('state'));
        }

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->input('customer_id'));
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->input('payment_status'));
        }

        $invoices = $query->orderBy('invoice_date', 'desc')->paginate(20);
        $states = ['draft', 'posted', 'sent', 'paid', 'cancelled'];
        $paymentStatuses = ['unpaid', 'partial', 'paid'];
        $customers = Customer::where('comp_id', $comp_id)->get();

        return Inertia::render('Sales/Invoice/Index', [
            'invoices' => $invoices,
            'states' => $states,
            'payment_statuses' => $paymentStatuses,
            'customers' => $customers,
            'filters' => [
                'search' => $request->input('search'),
                'state' => $request->input('state'),
                'customer_id' => $request->input('customer_id'),
                'payment_status' => $request->input('payment_status'),
            ],
        ]);
    }

    /**
     * Show form for creating a new invoice
     */
    public function create()
    {
        $user = auth()->user();
        $comp_id = $user->comp_id;

        $customers = Customer::where('comp_id', $comp_id)
            ->where('active_status', true)
            ->get();
        $salesOrders = SalesOrder::where('comp_id', $comp_id)
            ->where('state', '!=', 'cancelled')
            ->get();
        $deliveryOrders = DeliveryOrder::where('comp_id', $comp_id)
            ->where('status', 'completed')
            ->get();
        $products = InventoryItem::where('status', 'active')->get();
        $currencies = Currency::all();

        return Inertia::render('Sales/Invoice/Form', [
            'isCreate' => true,
            'customers' => $customers,
            'sales_orders' => $salesOrders,
            'delivery_orders' => $deliveryOrders,
            'products' => $products,
            'currencies' => $currencies,
        ]);
    }

    /**
     * Store a newly created invoice
     */
    public function store(Request $request)
    {
        $user = auth()->user();
        
        $validated = $request->validate([
            'customer_id' => 'required|exists:sales_customers,id',
            'invoice_date' => 'required|date',
            'due_date' => 'nullable|date',
            'currency_id' => 'required|exists:currencies,id',
            'exchange_rate' => 'nullable|numeric|min:0',
            'sales_order_id' => 'nullable|exists:sales_orders,id',
            'delivery_id' => 'nullable|exists:sales_deliveries,id',
            'terms_and_conditions' => 'nullable|string',
            'line_items' => 'nullable|array',
        ]);

        $invoice = Invoice::create([
            'comp_id' => $user->comp_id,
            'location_id' => $user->location_id,
            'invoice_no' => 'INV-' . time(),
            'state' => 'draft',
            'payment_status' => 'unpaid',
            'customer_id' => $validated['customer_id'],
            'sales_order_id' => $validated['sales_order_id'] ?? null,
            'delivery_id' => $validated['delivery_id'] ?? null,
            'invoice_date' => $validated['invoice_date'],
            'due_date' => $validated['due_date'],
            'currency_id' => $validated['currency_id'],
            'exchange_rate' => $validated['exchange_rate'] ?? 1,
            'terms_and_conditions' => $validated['terms_and_conditions'],
            'amount_untaxed' => 0,
            'amount_tax' => 0,
            'amount_total' => 0,
            'amount_total_base' => 0,
            'paid_amount' => 0,
            'outstanding_amount' => 0,
            'created_by' => $user->id,
        ]);

        // Create line items
        if (!empty($validated['line_items'])) {
            foreach ($validated['line_items'] as $index => $line) {
                if ($line['quantity'] > 0 && $line['unit_price'] > 0) {
                    InvoiceLine::create([
                        'invoice_id' => $invoice->id,
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

        $this->calculateInvoiceTotals($invoice);

        return redirect()->route('sales.invoice.index')
            ->with('success', 'Invoice created successfully');
    }

    /**
     * Show form for editing an invoice
     */
    public function edit(Invoice $invoice)
    {
        $invoice->load('lines.product', 'customer', 'currency');
        
        $user = auth()->user();
        $comp_id = $user->comp_id;

        $customers = Customer::where('comp_id', $comp_id)
            ->where('active_status', true)
            ->get();
        $salesOrders = SalesOrder::where('comp_id', $comp_id)
            ->where('state', '!=', 'cancelled')
            ->get();
        $deliveryOrders = DeliveryOrder::where('comp_id', $comp_id)
            ->where('status', 'completed')
            ->get();
        $products = InventoryItem::where('status', 'active')->get();
        $currencies = Currency::all();

        return Inertia::render('Sales/Invoice/Form', [
            'isCreate' => false,
            'invoice' => $invoice,
            'customers' => $customers,
            'sales_orders' => $salesOrders,
            'delivery_orders' => $deliveryOrders,
            'products' => $products,
            'currencies' => $currencies,
        ]);
    }

    /**
     * Update the specified invoice
     */
    public function update(Request $request, Invoice $invoice)
    {
        if ($invoice->state !== 'draft') {
            return back()->with('error', 'Only draft invoices can be edited');
        }

        $user = auth()->user();
        
        $validated = $request->validate([
            'customer_id' => 'required|exists:sales_customers,id',
            'invoice_date' => 'required|date',
            'due_date' => 'required|date',
            'currency_id' => 'required|exists:currencies,id',
            'notes_to_customer' => 'nullable|string',
            'internal_notes' => 'nullable|string',
            'lines' => 'required|array|min:1',
        ]);

        $invoice->update([
            'customer_id' => $validated['customer_id'],
            'invoice_date' => $validated['invoice_date'],
            'due_date' => $validated['due_date'],
            'currency_id' => $validated['currency_id'],
            'notes_to_customer' => $validated['notes_to_customer'] ?? null,
            'internal_notes' => $validated['internal_notes'] ?? null,
            'updated_by' => $user->id,
        ]);

        $invoice->lines()->delete();
        foreach ($validated['lines'] as $index => $line) {
            InvoiceLine::create([
                'invoice_id' => $invoice->id,
                'line_no' => $index + 1,
                'product_id' => $line['product_id'],
                'quantity' => $line['quantity'],
                'unit_price' => $line['unit_price'],
                'subtotal' => $line['quantity'] * $line['unit_price'],
            ]);
        }

        $this->calculateInvoiceTotals($invoice);

        return back()->with('success', 'Invoice updated successfully');
    }

    /**
     * Post an invoice (change state to posted)
     */
    public function post(Request $request, Invoice $invoice)
    {
        if ($invoice->state !== 'draft') {
            return back()->with('error', 'Only draft invoices can be posted');
        }

        $user = auth()->user();

        $invoice->update([
            'state' => 'posted',
            'status' => 'posted',
            'posted_at' => now(),
            'posted_by' => $user->id,
        ]);

        return back()->with('success', 'Invoice posted successfully');
    }

    /**
     * Calculate and update invoice totals
     */
    private function calculateInvoiceTotals(Invoice $invoice)
    {
        $lines = $invoice->lines()->get();
        $amount_untaxed = $lines->sum('subtotal');
        $amount_tax = 0; // Tax calculation to be implemented
        $amount_total = $amount_untaxed + $amount_tax;

        $invoice->update([
            'amount_untaxed' => $amount_untaxed,
            'amount_tax' => $amount_tax,
            'amount_total' => $amount_total,
            'amount_total_base' => $amount_total,
            'outstanding_amount' => $amount_total,
        ]);
    }

    /**
     * Delete an invoice
     */
    public function destroy(Invoice $invoice)
    {
        if ($invoice->state !== 'draft') {
            return back()->with('error', 'Only draft invoices can be deleted');
        }

        $invoice->delete();

        return back()->with('success', 'Invoice deleted successfully');
    }
}
