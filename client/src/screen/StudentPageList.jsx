import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Container, Button } from "react-bootstrap";

const StudentPageList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3900/api/student/all"
        );

        if (response.data && response.data.students) {
          setStudents(response.data.students);
        } else if (Array.isArray(response.data)) {
          setStudents(response.data);
        } else {
          setStudents([]);
        }
      } catch (err) {
        console.error(
          "Error fetching students:",
          err.response?.data || err.message
        );
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const copyEmail = (email) => {
    navigator.clipboard
      .writeText(email)
      .then(() => alert(`Copied: ${email}`))
      .catch((err) => console.error("Failed to copy:", err));
  };

  const deleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?"))
      return;

    try {
      await axios.delete(`http://localhost:3900/api/student/${id}`);
      // Remove deleted student from state to update UI
      setStudents(students.filter((student) => student._id !== id));
    } catch (err) {
      console.error(
        "Error deleting student:",
        err.response?.data || err.message
      );
      alert("Failed to delete student.");
    }
  };

  if (loading) {
    return <h3 className="text-center mt-4">Loading students...</h3>;
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-3">Student List</h2>

      {students.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email (click to copy)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student._id || index}>
                <td>{index + 1}</td>
                <td>{student.name}</td>
                <td
                  style={{ cursor: "pointer", color: "blue" }}
                  onClick={() => copyEmail(student.email)}
                  title="Click to copy"
                >
                  {student.email}
                </td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => deleteStudent(student._id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default StudentPageList;
