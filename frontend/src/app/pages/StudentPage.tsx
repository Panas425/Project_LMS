import { RenderMyCoursePage } from "./render/RenderMyCoursePage";
import { Header } from "../components/Header";

export function StudentPage() {


  return (
    <>
    <Header></Header>
    <div className="home-section">
    
      <RenderMyCoursePage />
    </div>
    </>
  );
}