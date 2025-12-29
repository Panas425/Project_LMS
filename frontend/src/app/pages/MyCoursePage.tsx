import { RenderMyCoursePage } from "./render/RenderMyCoursePage";
import { Header } from "../components/Header";

export function MyCoursePage() {


  return (
    <>
    <div className="home-section">
    <Header></Header>
      <RenderMyCoursePage />
    </div>
    </>
  );
}
