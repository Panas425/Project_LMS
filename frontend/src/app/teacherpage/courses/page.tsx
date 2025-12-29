import { AuthGuard } from "../../components/AuthGuard";
import { Header } from "../../components/Header";
import CoursesPage from "../../pages/CoursesPage";




export default function Page() {
  return <>
  <Header></Header>
    <CoursesPage />
  </>

}