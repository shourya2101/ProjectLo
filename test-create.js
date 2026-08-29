const token = 'fake-token'; // I need to get a real token

async function createProduct() {
  const payload = {
    title: "Test Product",
    description: "Test Description",
    category: "Computer Science",
    inventoryType: "DIGITAL",
    type: "SALE",
    priceSalePaise: 1000
  };
  const res = await fetch("http://localhost:4000/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` // Need a real token for authenticate middleware
    },
    body: JSON.stringify(payload)
  });
  console.log(res.status, await res.text());
}
createProduct();
