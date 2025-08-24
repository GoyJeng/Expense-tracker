import React, { useState } from "react";
import { Wallet } from "lucide-react";
import Dashboard from "./Dashboard";
import "./App.css"; 
import Expense from "./Expense";

function App() {
  const [activeTab, setActiveTab] = useState("expense");

  return (
    <div className="expense-tracker">
      <div className="header">
        <div className="header-container">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo">
                <Wallet size={24} color="white" />
              </div>
              <h1 className="title">Expense Tracker</h1>
            </div>
            <nav className="nav-tabs">
              <button
                onClick={() => setActiveTab("expense")}
                className={`nav-tab ${activeTab === "expense" ? "active" : ""}`}
              >
                เพิ่มรายการ
              </button>
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`nav-tab ${activeTab === "dashboard" ? "active" : ""}`}
              >
                Dashboard
              </button>
            </nav>
          </div>
        </div>
      </div>

      {activeTab === "expense" && <Expense />}
      {activeTab === "dashboard" && <Dashboard />}
    </div>
  );
}

export default App;