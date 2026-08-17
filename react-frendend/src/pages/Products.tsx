import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Table,
  Button,
  Card,
  Modal,
  Form,
  InputGroup,
  Badge,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";

const API_BASE_URL = "http://127.0.0.1:5000/api";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form State matching backend payload expectations
  const emptyForm = {
    id: null,
    name: "",
    category_id: "",
    price: "",
    stock: 0,
    description: "",
  };
  const [formData, setFormData] = useState(emptyForm);

  // Fetch products and categories on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/products`),
        axios.get(`${API_BASE_URL}/categories`),
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/products`);
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  // Filter products by search query (name or category_name)
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.category_name &&
        product.category_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Open modal for adding a new product
  const handleOpenAdd = () => {
    setIsEditMode(false);
    setFormData(emptyForm);
    setShowModal(true);
  };

  // Open modal for editing an existing product
  const handleOpenEdit = (product) => {
    setIsEditMode(true);
    setFormData({
      id: product.id,
      name: product.name,
      category_id: product.category_id || "",
      price: product.price,
      stock: product.stock,
      description: product.description || "",
    });
    setShowModal(true);
  };

  // Handle Form Submission (POST for create, PUT for update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      category_id: parseInt(formData.category_id, 10),
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10),
      description: formData.description,
    };

    try {
      if (isEditMode) {
        await axios.put(`${API_BASE_URL}/products/${formData.id}`, payload);
      } else {
        await axios.post(`${API_BASE_URL}/products`, payload);
      }
      await fetchProducts();
      setShowModal(false);
    } catch (err) {
      console.error("Error saving product:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Failed to save product");
    }
  };

  // Handle Delete Product
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`${API_BASE_URL}/products/${id}`);
        await fetchProducts();
      } catch (err) {
        console.error("Error deleting product:", err);
        alert("Failed to delete product");
      }
    }
  };

  return (
    <Container fluid className="p-4">
      {/* Header & Action Bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">Products Management</h3>
          <p className="text-muted mb-0">Add, edit, and track your store catalog</p>
        </div>
        <Button variant="primary" className="fw-semibold px-3 py-2" onClick={handleOpenAdd}>
          + Add New Product
        </Button>
      </div>

      {/* Main Card with Search and Table */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom-0 pt-3 pb-2">
          <Row className="g-2 justify-content-between align-items-center">
            <Col md={4}>
              <InputGroup size="sm">
                <InputGroup.Text bg="light">🔍</InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by name or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md="auto" className="text-muted small">
              Showing {filteredProducts.length} product(s)
            </Col>
          </Row>
        </Card.Header>

        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Loading catalog...</p>
            </div>
          ) : (
            <Table responsive hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-3">Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th className="text-end pe-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="ps-3 fw-semibold text-dark">
                        {product.name}
                        {product.description && (
                          <div className="text-muted small fw-normal">{product.description}</div>
                        )}
                      </td>
                      <td>{product.category_name || "Uncategorized"}</td>
                      <td>${Number(product.price).toFixed(2)}</td>
                      <td>{product.stock} pcs</td>
                      <td>
                        <Badge bg={product.stock > 0 ? "success" : "danger"}>
                          {product.stock > 0 ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </td>
                      <td className="text-end pe-3">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleOpenEdit(product)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Shared Add / Edit Product Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered backdrop="static">
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title className="fs-5 fw-bold">
              {isEditMode ? "Edit Product" : "Add New Product"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form.Group className="mb-3" controlId="productName">
              <Form.Label className="small fw-semibold">Product Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Wireless Mouse"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="productCategory">
              <Form.Label className="small fw-semibold">Category</Form.Label>
              <Form.Select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="productPrice">
                  <Form.Label className="small fw-semibold">Price ($)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="productStock">
                  <Form.Label className="small fw-semibold">Stock Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="productDescription">
              <Form.Label className="small fw-semibold">Description (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter product details..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" className="fw-semibold">
              {isEditMode ? "Save Changes" : "Create Product"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}