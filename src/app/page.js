import Header from "@/components/header";
import Footer from "@/components/footer";
import Body from "@/components/body";
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

const products = [
  {
    id: 0,
    name: "Product 0",
    category: "A",
    purchase_price: 300,
    sale_price: 340,
  },
  {
    id: 1,
    name: "Product 1",
    category: "B",
    purchase_price: 150,
    sale_price: 180,
  },
  {
    id: 2,
    name: "Product 2",
    category: "A",
    purchase_price: 500,
    sale_price: 450,
  },
  {
    id: 3,
    name: "Product 3",
    category: "C",
    purchase_price: 200,
    sale_price: 220,
  },
  {
    id: 4,
    name: "Product 4",
    category: "B",
    purchase_price: 350,
    sale_price: 370,
  },
  {
    id: 5,
    name: "Product 5",
    category: "A",
    purchase_price: 400,
    sale_price: 420,
  },
  {
    id: 6,
    name: "Product 6",
    category: "C",
    purchase_price: 250,
    sale_price: 260,
  },
  {
    id: 7,
    name: "Product 7",
    category: "B",
    purchase_price: 120,
    sale_price: 140,
  },
  {
    id: 8,
    name: "Product 8",
    category: "A",
    purchase_price: 600,
    sale_price: 580,
  },
  {
    id: 9,
    name: "Product 9",
    category: "C",
    purchase_price: 180,
    sale_price: 200,
  },
  {
    id: 10,
    name: "Product 10",
    category: "B",
    purchase_price: 400,
    sale_price: 410,
  },
  {
    id: 11,
    name: "Product 11",
    category: "A",
    purchase_price: 300,
    sale_price: 330,
  },
  {
    id: 12,
    name: "Product 12",
    category: "C",
    purchase_price: 220,
    sale_price: 230,
  },
  {
    id: 13,
    name: "Product 13",
    category: "B",
    purchase_price: 180,
    sale_price: 190,
  },
  {
    id: 14,
    name: "Product 14",
    category: "A",
    purchase_price: 550,
    sale_price: 500,
  },
  {
    id: 15,
    name: "Product 15",
    category: "C",
    purchase_price: 210,
    sale_price: 225,
  },
  {
    id: 16,
    name: "Product 15",
    category: "C",
    purchase_price: 210,
    sale_price: 225,
  },
  {
    id: 17,
    name: "Product 15",
    category: "C",
    purchase_price: 210,
    sale_price: 225,
  },
  {
    id: 18,
    name: "Product 15",
    category: "C",
    purchase_price: 210,
    sale_price: 225,
  },
  {
    id: 19,
    name: "Product 15",
    category: "C",
    purchase_price: 210,
    sale_price: 225,
  },
  {
    id: 20,
    name: "Product 15",
    category: "C",
    purchase_price: 210,
    sale_price: 225,
  },
  {
    id: 21,
    name: "Product 15",
    category: "C",
    purchase_price: 210,
    sale_price: 225,
  },
  {
    id: 22,
    name: "Product 15",
    category: "C",
    purchase_price: 210,
    sale_price: 225,
  },
  {
    id: 23,
    name: "Product 15",
    category: "C",
    purchase_price: 210,
    sale_price: 225,
  },
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
