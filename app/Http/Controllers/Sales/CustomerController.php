<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Sales\Customer;
use App\Models\Company;
use App\Models\Currency;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    /**
     * Display a listing of customers
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $comp_id = $user->comp_id;

        $query = Customer::where('comp_id', $comp_id);

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('customer_code', 'like', "%$search%")
                  ->orWhere('customer_name', 'like', "%$search%")
                  ->orWhere('primary_email', 'like', "%$search%");
            });
        }

        if ($request->filled('status')) {
            $query->where('active_status', $request->input('status') === 'active');
        }

        if ($request->filled('type')) {
            $query->where('customer_type', $request->input('type'));
        }

        $customers = $query->paginate(20);

        return Inertia::render('Sales/Customer/Index', [
            'customers' => $customers,
            'filters' => [
                'search' => $request->input('search'),
                'status' => $request->input('status'),
                'type' => $request->input('type'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new customer
     */
    public function create()
    {
        $currencies = Currency::all();
        $customerTypes = ['Individual', 'Company', 'Government'];

        return Inertia::render('Sales/Customer/Form', [
            'isCreate' => true,
            'currencies' => $currencies,
            'customerTypes' => $customerTypes,
        ]);
    }

    /**
     * Store a newly created customer in database
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:200',
            'customer_type' => 'required|in:Individual,Company,Government',
            'primary_email' => 'required|email',
            'currency_id' => 'required|exists:currencies,id',
            'active_status' => 'boolean',
        ]);

        $user = auth()->user();
        $validated['comp_id'] = $user->comp_id;
        $validated['location_id'] = $user->location_id;
        $validated['customer_code'] = 'CUST-' . time();
        $validated['created_by'] = $user->id;

        $customer = Customer::create($validated);

        return redirect()->route('sales.customer.edit', $customer->id)
            ->with('success', 'Customer created successfully');
    }

    /**
     * Show the form for editing the customer
     */
    public function edit(Customer $customer)
    {
        $currencies = Currency::all();
        $customerTypes = ['Individual', 'Company', 'Government'];

        return Inertia::render('Sales/Customer/Form', [
            'isCreate' => false,
            'customer' => $customer,
            'currencies' => $currencies,
            'customerTypes' => $customerTypes,
        ]);
    }

    /**
     * Update the specified customer in database
     */
    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:200',
            'customer_type' => 'required|in:Individual,Company,Government',
            'primary_email' => 'required|email',
            'currency_id' => 'required|exists:currencies,id',
            'active_status' => 'boolean',
        ]);

        $user = auth()->user();
        $validated['updated_by'] = $user->id;

        $customer->update($validated);

        return back()->with('success', 'Customer updated successfully');
    }

    /**
     * Remove the specified customer from database
     */
    public function destroy(Customer $customer)
    {
        $customer->delete();

        return back()->with('success', 'Customer deleted successfully');
    }
}
