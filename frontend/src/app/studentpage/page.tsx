import { AuthGuard } from "../components/AuthGuard";
import { Header } from "../components/Header";
import StudentDashboard from "../pages/StudentDashboard";
import { StudentPage } from "../pages/StudentPage";



export default function Page() {
  return <>
  <Header></Header>
  <AuthGuard >
    <StudentDashboard />
  </AuthGuard>
  </>

}