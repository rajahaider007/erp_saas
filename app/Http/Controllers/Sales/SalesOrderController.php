<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Sales\SalesOrder;
use App\Models\Sales\SalesOrderLine;
use App\Models\Sales\Customer;
use App\Models\Sales\Quotation;
use App\Models\InventoryItem;
use App\Models\Currency;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SalesOrderController extends Controller
{
    /**
     * Display a listing of sales orders
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $comp_id = $user->comp_id;

        $query = SalesOrder::with('customer')->where('comp_id', $comp_id);

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('so_number', 'like', "%$search%");
        }

        if ($request->filled('state')) {
            $query->where('state', $request->input('state'));
        }

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->input('customer_id'));
        }

        $orders = $query->orderBy('order_date', 'desc')->paginate(20);
        $states = ['draft', 'confirmed', 'in_delivery', 'delivered', 'invoiced', 'closed', 'cancelled'];
        $customers = Customer::where('comp_id', $comp_id)->get();

        return Inertia::render('Sales/SalesOrder/Index', [
            'orders' => $orders,
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
     * Show form for creating a new sales order
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

        return Inertia::render('Sales/SalesOrder/Form', [
            'isCreate' => true,
            'customers' => $customers,
            'products' => $products,
            'currencies' => $currencies,
        ]);
    }

    /**
     * Store a newly created sales order
     */
    public function store(Request $request)
    {
        $user = auth()->user();
        
        $validated = $request->validate([
            'customer_id' => 'required|exists:sales_customers,id',
            'order_date' => 'required|date',
            'commitment_date' => 'nullable|date',
            'currency_id' => 'required|exists:currencies,id',
            'exchange_rate' => 'nullable|numeric|min:0',
            'quotation_id' => 'nullable|exists:sales_quotations,id',
            'reference_no' => 'nullable|string',
            'notes' => 'nullable|string',
            'line_items' => 'nullable|array',
        ]);

        $salesOrder = SalesOrder::create([
            'comp_id' => $user->comp_id,
            'location_id' => $user->location_id,
            'sales_order_no' => 'SO-' . time(),
            'state' => 'draft',
            'customer_id' => $validated['customer_id'],
            'quotation_id' => $validated['quotation_id'] ?? null,
            'order_date' => $validated['order_date'],
            'commitment_date' => $validated['commitment_date'],
            'currency_id' => $validated['currency_id'],
            'exchange_rate' => $validated['exchange_rate'] ?? 1,
            'reference_no' => $validated['reference_no'],
            'notes' => $validated['notes'],
            'amount_untaxed' => 0,
            'amount_tax' => 0,
            'amount_total' => 0,
            'amount_total_base' => 0,
            'created_by' => $user->id,
        ]);

        // Create line items
        if (!empty($validated['line_items'])) {
            foreach ($validated['line_items'] as $index => $line) {
                if ($line['quantity'] > 0 && $line['unit_price'] > 0) {
                    SalesOrderLine::create([
                        'sales_order_id' => $salesOrder->id,
                        'product_id' => $line['product_id'] ?? null,
                        'product_name' => $line['product_name'] ?? 'Service',
                        'product_code' => $line['product_code'] ?? null,
                        'quantity' => $line['quantity'],
                        'delivered_qty' => 0,
                        'invoiced_qty' => 0,
                        'remaining_qty' => $line['quantity'],
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

        $this->calculateSalesOrderTotals($salesOrder);

        return redirect()->route('sales.order.index')
            ->with('success', 'Sales order created successfully');
    }

    /**
     * Show form for editing a sales order
     */
    public function edit(SalesOrder $order)
    {
        $order->load('lines.product', 'customer', 'currency');
        
        $user = auth()->user();
        $comp_id = $user->comp_id;

        $customers = Customer::where('comp_id', $comp_id)
            ->where('active_status', true)
            ->get();
        $products = InventoryItem::where('status', 'active')->get();
        $currencies = Currency::all();

        return Inertia::render('Sales/SalesOrder/Form', [
            'isCreate' => false,
            'order' => $order,
            'customers' => $customers,
            'products' => $products,
            'currencies' => $currencies,
        ]);
    }

    /**
     * Update the specified sales order
     */
    public function update(Request $request, SalesOrder $order)
    {
        if (!in_array($order->state, ['draft', 'confirmed'])) {
            return back()->with('error', 'Only draft or confirmed sales orders can be edited');
        }

        $user = auth()->user();
        
        $validated = $request->validate([
            'customer_id' => 'required|exists:sales_customers,id',
            'order_date' => 'required|date',
            'commitment_date' => 'required|date',
            'currency_id' => 'required|exists:currencies,id',
            'notes' => 'nullable|string',
            'line_items' => 'required|array|min:1',
        ]);

        $order->update([
            'customer_id' => $validated['customer_id'],
            'order_date' => $validated['order_date'],
            'commitment_date' => $validated['commitment_date'],
            'currency_id' => $validated['currency_id'],
            'notes' => $validated['notes'] ?? null,
            'updated_by' => $user->id,
        ]);

        $order->lines()->delete();
        foreach ($validated['line_items'] as $index => $line) {
            SalesOrderLine::create([
                'sales_order_id' => $order->id,
                'product_id' => $line['product_id'] ?? null,
                'product_name' => $line['product_name'] ?? 'Service',
                'product_code' => $line['product_code'] ?? null,
                'quantity' => $line['quantity'],
                'delivered_qty' => 0,
                'invoiced_qty' => 0,
                'remaining_qty' => $line['quantity'],
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

        $this->calculateSalesOrderTotals($order);

        return back()->with('success', 'Sales order updated successfully');
    }

    /**
     * Calculate and update sales order totals
     */
    private function calculateSalesOrderTotals(SalesOrder $order)
    {
        $lines = $order->lines()->get();
        $amount_untaxed = $lines->sum('subtotal');
        $amount_tax = 0; // Tax calculation to be implemented
        $amount_total = $amount_untaxed + $amount_tax;

        $order->update([
            'amount_untaxed' => $amount_untaxed,
            'amount_tax' => $amount_tax,
            'amount_total' => $amount_total,
            'amount_total_base' => $amount_total,
        ]);
    }

    /**
     * Delete a sales order
     */
    public function destroy(SalesOrder $order)
    {
        if ($order->state !== 'draft') {
            return back()->with('error', 'Only draft sales orders can be deleted');
        }

        $order->delete();

        return back()->with('success', 'Sales order deleted successfully');
    }
}
