import NavBar from "@/components/NavBar";
import CalandarGraphWrapper from "@/components/CalandarGraphWrapper";
export default function Home() {
  return (
    <div className="container flex flex-col items-center max-w-[100vw] ">
      <NavBar />
      <CalandarGraphWrapper />
    </div>
  );
}
