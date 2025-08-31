import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Phone, Users, Package, X, Check, TestTube, LogOut } from "lucide-react";
import { BASE_URL } from "@/lib/constants";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

type Product = {
  id: string;
  name: string;
  description: string;
  keyDetails: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

const Dashboard: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [callNotes, setCallNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [testPhoneNumber, setTestPhoneNumber] = useState("");
  const [testSelectedProduct, setTestSelectedProduct] = useState("");

  // Fetch customers and products
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch customers
      const customersRes = await fetch(`${BASE_URL}/customers`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Fetch products
      const productsRes = await fetch(`${BASE_URL}/products`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (customersRes.ok) {
        const customersData = await customersRes.json();
        setCustomers(customersData);
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData);
      }
    } catch (error) {
      toast.error("Failed to fetch data");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  const selectedCustomersList = customers.filter((c) =>
    selectedCustomers.includes(c.id)
  );
  const selectedProductData = products.find((p) => p.id === selectedProduct);

  const handleCall = () => {
    if (selectedCustomers.length === 0) {
      toast.error("Please select at least one customer");
      return;
    }
    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }
    setIsCallModalOpen(true);
  };

  const makeCall = async () => {
    try {
      // Get the first selected customer and product details
      const firstCustomer = customers.find(c => c.id === selectedCustomers[0]);
      const selectedProductInfo = products.find(p => p.id === selectedProduct);

      if (!firstCustomer || !selectedProductInfo) {
        toast.error("Customer or product data not found");
        return;
      }

      // Send only first customer's phone and product description
      const callData = {
        phone_number: firstCustomer.phone,
        custom_instructions: selectedProductInfo.description
      };

      const response = await fetch(`https://voice-call.subhadeep.xyz/make-call`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(callData)
      });

      if (response.ok) {
        toast.success(
          `📞 Calling ${firstCustomer.name} (${firstCustomer.phone}) about ${selectedProductInfo.name}`
        );
      } else {
        throw new Error("Call initiation failed");
      }

      setIsCallModalOpen(false);
      setCallNotes("");
      // Reset selections after call
      setSelectedCustomers([]);
      setSelectedProduct("");
    } catch (error) {
      toast.error("Failed to initiate calls");
      console.error("Call error:", error);
    }
  };

  const makeTestCall = async () => {
    try {
      if (!testPhoneNumber.trim()) {
        toast.error("Please enter a phone number");
        return;
      }
      if (!testSelectedProduct) {
        toast.error("Please select a product");
        return;
      }

      const selectedProductInfo = products.find(p => p.id === testSelectedProduct);
      if (!selectedProductInfo) {
        toast.error("Product data not found");
        return;
      }

      const callData = {
        phone_number: testPhoneNumber.trim(),
        custom_instructions: selectedProductInfo.description
      };

      const response = await fetch(`https://voice-call.subhadeep.xyz/make-call`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(callData)
      });

      if (response.ok) {
        toast.success(
          `📞 Test call initiated to ${testPhoneNumber} about ${selectedProductInfo.name}`
        );
        // Reset test form
        setTestPhoneNumber("");
        setTestSelectedProduct("");
      } else {
        throw new Error("Test call initiation failed");
      }
    } catch (error) {
      toast.error("Failed to initiate test call");
      console.error("Test call error:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Logout */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{customers.length}</p>
                <p className="text-gray-600">Total Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{products.length}</p>
                <p className="text-gray-600">Total Products</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Phone className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{selectedCustomers.length}</p>
                <p className="text-gray-600">Selected for Call</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Calling Section */}
      <Card className="border-orange-200 bg-orange-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700">
            <TestTube className="h-5 w-5" />
            Test Calling
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="testPhone" className="text-base font-medium">
                Phone Number
              </Label>
              <Input
                id="testPhone"
                type="tel"
                value={testPhoneNumber}
                onChange={(e) => setTestPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-base font-medium">
                Select Product
              </Label>
              <div className="mt-1 max-h-32 overflow-y-auto border rounded-lg">
                {products.length > 0 ? (
                  products.map((product) => (
                    <div
                      key={product.id}
                      className={`p-2 cursor-pointer transition-all duration-200 border-b last:border-b-0 ${testSelectedProduct === product.id
                        ? "bg-orange-100 text-orange-900"
                        : "hover:bg-gray-50"
                        }`}
                      onClick={() => setTestSelectedProduct(product.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {product.keyDetails}
                          </p>
                        </div>
                        {testSelectedProduct === product.id && (
                          <Check className="h-4 w-4 text-orange-600 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No products available
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-end">
              <Button
                onClick={makeTestCall}
                disabled={!testPhoneNumber.trim() || !testSelectedProduct}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                <Phone className="h-4 w-4 mr-2" />
                Make Test Call
              </Button>
            </div>
          </div>

          {testSelectedProduct && (
            <div className="mt-4 p-3 bg-white border border-orange-200 rounded-lg">
              <p className="text-sm font-medium text-orange-800">
                Selected Product: {products.find(p => p.id === testSelectedProduct)?.name}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {products.find(p => p.id === testSelectedProduct)?.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Multi-Select */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select Customers ({selectedCustomers.length} selected)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {customers.length > 0 ? (
                customers.map((customer) => (
                  <div
                    key={customer.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${selectedCustomers.includes(customer.id)
                      ? "bg-blue-50 border-blue-500 shadow-sm"
                      : "hover:bg-gray-50 hover:border-gray-300"
                      }`}
                    onClick={() => handleCustomerSelect(customer.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {customer.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {customer.email}
                        </p>
                        <p className="text-sm text-gray-500">
                          {customer.phone}
                        </p>
                      </div>
                      {selectedCustomers.includes(customer.id) && (
                        <div className="flex-shrink-0">
                          <Check className="h-5 w-5 text-blue-500" />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No customers available</p>
                  <p className="text-sm text-gray-400">
                    Add customers to start making calls
                  </p>
                </div>
              )}
            </div>

            {/* Select All / Clear All buttons */}
            {customers.length > 0 && (
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSelectedCustomers(customers.map((c) => c.id))
                  }
                  disabled={selectedCustomers.length === customers.length}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCustomers([])}
                  disabled={selectedCustomers.length === 0}
                >
                  Clear All
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Single Select */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Select Product
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {products.length > 0 ? (
                products.map((product) => (
                  <div
                    key={product.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${selectedProduct === product.id
                      ? "bg-green-50 border-green-500 shadow-sm"
                      : "hover:bg-gray-50 hover:border-gray-300"
                      }`}
                    onClick={() => setSelectedProduct(product.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {product.description}
                        </p>
                        <p className="text-sm text-blue-600 mt-1 font-medium">
                          {product.keyDetails}
                        </p>
                      </div>
                      {selectedProduct === product.id && (
                        <div className="flex-shrink-0">
                          <Check className="h-5 w-5 text-green-500" />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No products available</p>
                  <p className="text-sm text-gray-400">
                    Add products to start making calls
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Call Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <Label className="text-base font-medium">
                  Selected Customers ({selectedCustomers.length})
                </Label>
                <div className="mt-2 p-3 border rounded-lg min-h-[100px] bg-gray-50">
                  {selectedCustomersList.length > 0 ? (
                    <div className="space-y-2">
                      {selectedCustomersList.map((customer) => (
                        <div
                          key={customer.id}
                          className="flex items-center justify-between bg-white p-2 rounded border"
                        >
                          <div>
                            <span className="font-medium text-sm">
                              {customer.name}
                            </span>
                            <span className="text-gray-500 text-xs ml-2">
                              {customer.phone}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCustomerSelect(customer.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500 text-sm">
                        No customers selected
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">
                  Selected Product
                </Label>
                <div className="mt-2 p-3 border rounded-lg min-h-[100px] bg-gray-50">
                  {selectedProductData ? (
                    <div className="bg-white p-3 rounded border">
                      <h4 className="font-medium text-green-700">
                        {selectedProductData.name}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {selectedProductData.description}
                      </p>
                      <p className="text-xs text-blue-600 mt-2 font-medium">
                        {selectedProductData.keyDetails}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500 text-sm">
                        No product selected
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={handleCall}
              disabled={selectedCustomers.length === 0 || !selectedProduct}
              className="w-full"
              size="lg"
            >
              <Phone className="h-4 w-4 mr-2" />
              Start Call Session ({selectedCustomers.length} customers)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Call Modal */}
      {isCallModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Initiate Call Session
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCallModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium text-green-700">
                  Product to discuss:
                </Label>
                <div className="mt-1 p-2 bg-green-50 rounded border">
                  <p className="font-medium">{selectedProductData?.name}</p>
                  <p className="text-sm text-gray-600">
                    {selectedProductData?.keyDetails}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-base font-medium text-blue-700">
                  Customers to call ({selectedCustomers.length}):
                </Label>
                <div className="mt-1 max-h-32 overflow-y-auto space-y-1">
                  {selectedCustomersList.map((customer) => (
                    <div
                      key={customer.id}
                      className="flex justify-between items-center text-sm p-2 bg-blue-50 rounded"
                    >
                      <span className="font-medium">{customer.name}</span>
                      <span className="text-gray-600">{customer.phone}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">
                  Call Notes (Optional)
                </Label>
                <Textarea
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="Add any notes about this call session..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={makeCall} className="flex-1">
                  <Phone className="h-4 w-4 mr-2" />
                  Start Calling Now
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCallModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;