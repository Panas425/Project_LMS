import { ReactElement, useContext, useState } from "react";
import { ICourses, IUser } from "../../utilsNode";
import { ModalPopupCreateUser } from "../../components/ModalPopupCreateUser";
import { Header } from "../../components/Header";
import { useApiDataStore } from "../../storesNode/apiDataStore";


interface RenderMyCoursePageProps {
  course: ICourses[] | null;
  users: IUser[] | null;
  deleteUser: (userId: string) => Promise<void>;
}

export function RenderUserListPage({
  users,
  course,
  deleteUser
}: RenderMyCoursePageProps): ReactElement {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadedUsers, setUploadedUsers] = useState<any[]>([]);

  const { uploadUsersExcel } = useApiDataStore();

  const openModal = () => setShowModal(true);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadMessage("Please select an Excel file first.");
      return;
    }
    try {
      const { message, users } = await uploadUsersExcel(file);
      setUploadMessage(message);
      setUploadedUsers(users);
    } catch {
      setUploadMessage("Error uploading file. Please try again.");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      window.location.reload();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const filteredUsers =
    users?.filter((user) => {
      const matchesSearch = (user.userName ?? "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCourse = selectedCourse
        ? user.courseIDs?.includes(selectedCourse) ?? false
        : true;
      return matchesSearch && matchesCourse;
    }) || [];

  return (
    <div className="container-fluid p-3">

      <div className="row mt-4">
        {/* Sidebar */}
        <aside className="col-md-3 mb-4">
          <div className="card p-3 shadow-sm">
            <h5 className="card-title mb-3">Filters & Upload</h5>

            <input
              type="text"
              placeholder="Search by username"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control mb-3"
            />

            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="form-select mb-3"
            >
              <option value="">All Courses</option>
              {course?.map((c) => c._id ? (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ) : null)}
            </select>

            <hr />

            <label className="form-label fw-bold">Bulk Upload via Excel</label>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="form-control mb-2"
            />
            <button className="btn btn-primary w-100 mb-2" onClick={handleUpload}>
              Upload & Register
            </button>
            {uploadMessage && <small className="text-muted">{uploadMessage}</small>}
            {uploadedUsers.length > 0 && (
              <ul className="list-group list-group-flush mt-2 small">
                {uploadedUsers.map((user, idx) => (
                  <li key={idx} className="list-group-item py-1">
                    <strong>{user.userName}</strong> ({user.email})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* User List */}
        <main className="col-md-9">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="users-label">Users</h4>
            <button className="btn btn-success" onClick={openModal}>
              Create User
            </button>
          </div>

          <div className="row">
            {filteredUsers.length === 0 ? (
              <div className="col-12">
                <p className="text-muted">No users found.</p>
              </div>
            ) : (
              filteredUsers.map((user) => {
                // Get all courses assigned to this user
                const userCourses = course?.filter((c) => user.courseIDs?.includes(c._id)) || [];

                return (
                  <div key={user._id} className="col-md-6 col-lg-4 mb-3">
                    <div className="card shadow-sm h-100">
                      <div className="card-body d-flex flex-column justify-content-between">
                        <div>
                          <h6 className="card-title">{user.userName}</h6>
                          <p className="card-text mb-1">
                            <span className="badge bg-secondary me-1">{user.role}</span>
                            {userCourses.length > 0 ? (
                              userCourses.map((c) => (
                                <span key={c._id} className="badge bg-info text-dark me-1">
                                  {c.name}
                                </span>
                              ))
                            ) : (
                              <span>No Courses Assigned</span>
                            )}
                          </p>
                        </div>
                        <button
                          className="btn btn-danger btn-sm mt-2"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </main>
      </div>

      <ModalPopupCreateUser show={showModal} setShow={setShowModal} />
    </div>
  );
}
