import Navbar from "./navbar/Navbar";
import Sidebar from "./Sidebar";

const DashboardLayout = ({ children }) => {
    return (<div className="flex h-screen overflow-hidden"> <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
            <Navbar />

            <main
                className="
    flex-1
    overflow-y-auto
    px-6
    py-8
  "
            >
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    </div>


    );
};

export default DashboardLayout;
