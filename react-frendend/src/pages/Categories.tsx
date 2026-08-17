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
  Row,
  Col,
  Spinner,
} from "react-bootstrap";

const API_BASE_URL = "http://127.0.0.1:5000/api";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const emptyForm = { id: null, name: "" };
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter categories by search query
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open modal for creating a new category
  const handleOpenAdd = () => {
    setIsEditMode(false);
    setFormData(emptyForm);
    setShowModal(true);
  };

  // Open modal for editing an existing category
  const handleOpenEdit = (category) => {
    setIsEditMode(true);
    setFormData({ id: category.id, name: category.name });
    setShowModal(true);
  };

  // Handle Form Submission (POST or PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEditMode) {
        await axios.put(`${API_BASE_URL}/categories/${formData.id}`, {
          name: formData.name,
        });
      } else {
        await axios.post(`${API_BASE_URL}/categories`, {
          name: formData.name,
        });
      }
      await fetchCategories();
      setShowModal(false);
    } catch (err) {
      console.error("Error saving category:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Failed to save category");
    }
  };

  // Handle Delete Category
  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this category? Linked products will also be removed."
      )
    ) {
      try {
        await axios.delete(`${API_BASE_URL}/categories/${id}`);
        await fetchCategories();
      } catch (err) {
        console.error("Error deleting category:", err);
        alert("Failed to delete category");
      }
    }
  };

  return (
    <Container fluid className="p-4">
      {/* Header & Action Bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">Categories Management</h3>
          <p className="text-muted mb-0">Organize and manage your store product categories</p>
        </div>
        <Button variant="primary" className="fw-semibold px-3 py-2" onClick={handleOpenAdd}>
          + Add New Category
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
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md="auto" className="text-muted small">
              Showing {filteredCategories.length} category(ies)
            </Col>
          </Row>
        </Card.Header>

        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Loading categories...</p>
            </div>
          ) : (
            <Table responsive hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-3" style={{ width: "100px" }}>
                    ID
                  </th>
                  <th>Category Name</th>
                  <th>Created Date</th>
                  <th className="text-end pe-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <tr key={category.id}>
                      <td className="ps-3 text-muted font-monospace">#{category.id}</td>
                      <td className="fw-semibold text-dark">{category.name}</td>
                      <td className="text-muted small">
                        {category.created_at
                          ? new Date(category.created_at).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="text-end pe-3">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleOpenEdit(category)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-muted">
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Add / Edit Category Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered backdrop="static">
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title className="fs-5 fw-bold">
              {isEditMode ? "Edit Category" : "Add New Category"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form.Group controlId="categoryName">
              <Form.Label className="small fw-semibold">Category Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Electronics"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                autoFocus
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" className="fw-semibold">
              {isEditMode ? "Save Changes" : "Create Category"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}