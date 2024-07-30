import Header from "@/components/header";
import Footer from "@/components/footer";
import Body from "@/components/body";
import products from "@/components/products";
import {
  FaPlus,
  FaCogs,
  FaCloudUploadAlt,
  FaFileExport,
  FaTrashAlt,
  FaUsers,
} from "react-icons/fa";

const user = {
  name: "Abdul Saboor",
  profile_pic: "/avatar.png",
};

const buttons = [
  { btn_name: "Add Product", icon: <FaPlus /> },
  { btn_name: "Manage Categories", icon: <FaCogs /> },
  { btn_name: "Load Data", icon: <FaCloudUploadAlt /> },
  { btn_name: "Export Data", icon: <FaFileExport /> },
  { btn_name: "Clear Data", icon: <FaTrashAlt /> },
  { btn_name: "Manage Users", icon: <FaUsers /> },
];

export default function Home() {
  return (
    <main className={`flex min-h-screen flex-col items-center justify-between`}>
      <div className="max-w-[1440px] w-full">
        <Header buttons={buttons} user={user} />
        <Body buttons={buttons} products={products} />
        <Footer />
      </div>
    </main>
  );
}
