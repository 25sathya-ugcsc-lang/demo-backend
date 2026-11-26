// E2E test: Steps 3–9 — no browser required
(async () => {
  const base = "http://localhost:5000/api";
  const H = (tok) => ({
    "Content-Type": "application/json",
    ...(tok ? { Authorization: "Bearer " + tok } : {}),
  });
  const req = async (url, method = "GET", body = null, tok = null) => {
    const r = await fetch(base + url, {
      method,
      headers: H(tok),
      body: body ? JSON.stringify(body) : undefined,
    });
    const d = await r.json().catch(() => ({}));
    return { status: r.status, data: d };
  };

  const results = [];
  const P = (name, ok, detail = "") => {
    results.push({ name, status: ok ? "PASS" : "FAIL", detail: String(detail) });
    if (!ok) console.error("FAIL:", name, "|", detail);
  };

  // STEP 1: Admin login
  const aRes = await req("/auth/login", "POST", { email: "admin@styleaura.com", password: "admin123" });
  P("Step 1: Admin Login", aRes.status === 200 && aRes.data.user?.role === "Admin", aRes.status);
  const adminTok = aRes.data.token;

  // STEP 2: Admin adds product
  const addProd = await req("/products", "POST", {
    name: "Browser Test Silk Gown",
    category: "dresses",
    categoryName: "Dresses",
    price: 3499,
    originalPrice: 4299,
    stock: 10,
    description: "Test gown added from admin dashboard",
  }, adminTok);
  P("Step 2: Admin creates product", addProd.status === 201, addProd.data._id || addProd.data.message);
  const prodId = addProd.data._id;

  // STEP 3: User GET /products sees new product
  const prodsRes = await req("/products");
  const hasGown = Array.isArray(prodsRes.data) && prodsRes.data.some((p) => p.name === "Browser Test Silk Gown");
  P("Step 3: User /products sees admin product", hasGown, prodsRes.data.length + " products total");

  // STEP 4: New user registers
  const email = "buyer_" + Date.now() + "@styleaura.com";
  const regRes = await req("/auth/register", "POST", { name: "Test Buyer", email, password: "password123" });
  P("Step 4a: User Registration succeeds", regRes.status === 201 && !!regRes.data.token, regRes.data.message || regRes.status);
  P("Step 4b: Registered role is User", regRes.data.user?.role === "User", regRes.data.user?.role);
  const userTok = regRes.data.token;

  // STEP 5a: Wishlist
  const wishRes = await req("/wishlist/toggle", "POST", { productId: prodId }, userTok);
  P("Step 5a: Add to Wishlist", wishRes.status === 200 && wishRes.data.some((p) => (p._id || p.id) === prodId), wishRes.status);

  // STEP 5b: Cart add
  const cartRes = await req("/cart", "POST", {
    productId: prodId,
    name: "Browser Test Silk Gown",
    price: 3499,
    originalPrice: 4299,
    size: "M",
    color: "Lavender",
    quantity: 1,
  }, userTok);
  P("Step 5b: Add to Cart", cartRes.status === 200 && cartRes.data.length > 0, cartRes.status);

  // STEP 5c: Cart verified via GET
  const getCart = await req("/cart", "GET", null, userTok);
  P("Step 5c: GET /cart reflects item", getCart.data.length > 0, getCart.data.length + " items");

  // STEP 6: Place order (checkout)
  const orderRes = await req("/orders", "POST", {
    customerName: "Test Buyer",
    customerEmail: email,
    customerPhone: "9876543210",
    items: [{ product: prodId, name: "Browser Test Silk Gown", quantity: 1, price: 3499, size: "M", color: "Lavender" }],
    subtotal: 3499,
    discount: 0,
    shipping: 0,
    tax: 420,
    total: 3919,
    paymentMethod: "card",
    shippingAddress: "123 Test St, Mumbai, 400001",
  }, userTok);
  P("Step 6: User places order", orderRes.status === 201 && !!orderRes.data.orderNumber, orderRes.data.message || orderRes.status);
  const orderId = orderRes.data._id;
  const orderNum = orderRes.data.orderNumber;

  // STEP 6b: Cart auto-cleared after order
  const cartAfter = await req("/cart", "GET", null, userTok);
  P("Step 6b: Cart cleared after order", cartAfter.data.length === 0, cartAfter.data.length + " items remain");

  // STEP 6c: User sees own order
  const myOrders = await req("/orders/my", "GET", null, userTok);
  P("Step 6c: User GET /orders/my has order", myOrders.data.some((o) => o._id === orderId), myOrders.data.length + " orders");

  // STEP 7: Admin sees shared order
  const adminOrders = await req("/orders", "GET", null, adminTok);
  const foundOrder = adminOrders.data.find((o) => o._id === orderId);
  P("Step 7: Admin sees Test Buyer order (shared DB)", !!foundOrder, foundOrder ? foundOrder.customerName + " | " + foundOrder.orderNumber : "not found");

  // STEP 7b: Admin notification created
  const notifRes = await req("/admin/notifications", "GET", null, adminTok);
  const orderNotif = notifRes.data.find((n) => n.type === "order" && n.message.includes(orderNum));
  P("Step 7b: Admin notification for new order", !!orderNotif, notifRes.data.length + " notifications");

  // STEP 8: Admin updates status to Shipped
  const updateRes = await req("/orders/" + orderId + "/status", "PUT", { status: "Shipped" }, adminTok);
  P("Step 8: Admin updates order status to Shipped", updateRes.status === 200 && updateRes.data.status === "Shipped", updateRes.data.status || updateRes.status);

  // STEP 9: Persist check — reload from MongoDB
  const reloadOrders = await req("/orders", "GET", null, adminTok);
  const persisted = reloadOrders.data.find((o) => o._id === orderId);
  P("Step 9: Shipped status persists in MongoDB", persisted?.status === "Shipped", persisted?.status || "not found");

  // STEP 9b: Stats updated
  const stats = await req("/admin/stats", "GET", null, adminTok);
  P("Step 9b: Admin /admin/stats live", stats.status === 200 && stats.data.totalOrders > 0, JSON.stringify(stats.data));

  // STEP 9c: Stock decremented
  const prodAfter = await req("/products/" + prodId);
  P("Step 9c: Product stock decremented after order", prodAfter.data.stock === 9, "stock=" + prodAfter.data.stock);

  // CORS preflight check for port 5175
  const corsCheck = await fetch("http://localhost:5000/api/products", {
    method: "OPTIONS",
    headers: {
      Origin: "http://localhost:5175",
      "Access-Control-Request-Method": "GET",
    },
  });
  P("CORS: port 5175 allowed", corsCheck.ok || corsCheck.status === 204 || corsCheck.headers.get("access-control-allow-origin") === "http://localhost:5175",
    "CORS status=" + corsCheck.status + " allow-origin=" + corsCheck.headers.get("access-control-allow-origin"));

  // Admin login redirect fix
  const aLoginAgain = await req("/auth/login", "POST", { email: "admin@styleaura.com", password: "admin123" });
  P("Admin Login returns token for redirect", !!aLoginAgain.data.token && aLoginAgain.data.user?.role === "Admin", aLoginAgain.status);

  // Cleanup test data
  await req("/orders/" + orderId, "DELETE", null, adminTok);
  await req("/products/" + prodId, "DELETE", null, adminTok);
  await req("/wishlist", "DELETE", null, userTok);

  console.log("\n=== E2E TEST RESULTS ===");
  console.table(results);
  const failed = results.filter((r) => r.status === "FAIL");
  if (failed.length) {
    console.error("\n" + failed.length + " FAILED test(s):");
    failed.forEach((f) => console.error("  -", f.name, "->", f.detail));
    process.exit(1);
  } else {
    console.log("\nALL", results.length, "TESTS PASSED");
  }
})();
