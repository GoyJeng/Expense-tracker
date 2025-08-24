import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Filter, Calendar, Wallet, BarChart3, TrendingUp } from "lucide-react";
import { supabase } from "./supabaseClient";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

function Dashboard() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [summary, setSummary] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [sortOption, setSortOption] = useState("date_desc");


    const sortedExpenses = [...expenses].sort((a, b) => {
  switch (sortOption) {
    case "date_asc":
      return new Date(a.date) - new Date(b.date);
    case "title_asc":
      return a.title.localeCompare(b.title, "th");
    case "title_desc":
      return b.title.localeCompare(a.title, "th");
    case "amount_asc":
      return a.amount - b.amount;
    case "amount_desc":
      return b.amount - a.amount;
    default: // date_desc
      return new Date(b.date) - new Date(a.date);
  }
});

const fetchSummary = async () => {
  setIsLoading(true);
  try {
    let query = supabase.from("expenses").select("category, amount, date");

    if (startDate && endDate) {
      query = query
        .gte("date", `${startDate}T00:00:00.000Z`)
        .lte("date", `${endDate}T23:59:59.999Z`);
    } else if (startDate) {
      query = query.gte("date", `${startDate}T00:00:00.000Z`);
    } else if (endDate) {
      query = query.lte("date", `${endDate}T23:59:59.999Z`);
    }

    let { data, error } = await query;
    if (error) {
      console.error("Fetch error:", error.message);
      setSummary([]);
    } else {
      const grouped = {};
      data.forEach((item) => {
        grouped[item.category] = (grouped[item.category] || 0) + parseFloat(item.amount);
      });
      setSummary(Object.entries(grouped).map(([k, v]) => ({ name: k, value: v })));
    }
  } catch (error) {
    console.error("Error fetching summary:", error);
  } finally {
    setIsLoading(false);
  }
};



const fetchExpenses = async () => {
  setIsLoading(true);
  try {
    let query = supabase.from("expenses").select("*").order("date", { ascending: false });

    if (startDate && endDate) {
      query = query
        .gte("date", `${startDate}T00:00:00.000Z`)
        .lte("date", `${endDate}T23:59:59.999Z`);
    } else if (startDate) {
      query = query.gte("date", `${startDate}T00:00:00.000Z`);
    } else if (endDate) {
      query = query.lte("date", `${endDate}T23:59:59.999Z`);
    }

    let { data, error } = await query;
    if (error) {
      console.error("Fetch error:", error.message);
      setExpenses([]);
    } else {
      setExpenses(data ?? []);
    }
  } catch (error) {
    console.error("Error fetching expenses:", error);
    setExpenses([]);
  } finally {
    setIsLoading(false);
  }
};


useEffect(() => {
  fetchExpenses();
  fetchSummary();
}, [startDate, endDate]);


  const totalExpenses = summary.reduce((sum, item) => sum + item.value, 0);
  const averageExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
  const highestCategory = summary.reduce((max, item) => 
    item.value > max.value ? item : max, { value: 0, name: "" });

  return (
    <div className="main-container">
      {showPopup && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', width: '90%', maxWidth: '500px', maxHeight: '80%', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>รายการ {expenses.length} รายการ</h3>
              <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                <option value="date_desc">📅 วันที่ล่าสุด</option>
                <option value="date_asc">📅 วันที่เก่าสุด</option>
                <option value="title_asc">🔤 ชื่อ (A-Z)</option>
                <option value="title_desc">🔤 ชื่อ (Z-A)</option>
                <option value="amount_desc">💸 จำนวนเงินมากสุด</option>
                <option value="amount_asc">💸 จำนวนเงินน้อยสุด</option>
              </select>
            </div>

            <ul>
              {sortedExpenses.map(e => (
                <li key={e.expense_id} style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                  <strong>{e.title}</strong> - {e.amount.toLocaleString()} บาท
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>
                    {new Date(e.date).toLocaleString("th-TH")}
                  </div>
                </li>
              ))}
            </ul>

            <button
              onClick={() => setShowPopup(false)}
              style={{ marginTop: '1rem', padding: '8px 12px', borderRadius: '8px', backgroundColor: '#3b82f6', color: '#fff', cursor: 'pointer' }}
            >
              ปิด
            </button>
          </div>
        </div>
      )}


    <div className="card" style={{marginBottom: '2rem'}}>
        <div className="card-header">
          <div className="card-icon blue">
            <Filter size={20} />
          </div>
          <h3 className="card-title">Filter ช่วงเวลา</h3>
            </div>
            <div className="filter-grid">
          <div>
            <label className="form-label">วันที่เริ่มต้น</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="form-input"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="form-label">วันที่สิ้นสุด</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="form-input"
              disabled={isLoading}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'end' }}>
            <button 
              onClick={fetchSummary} 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "กำลังโหลด..." : "Apply"}
            </button>
          </div>
        </div>
        
        {/* Quick Filter Buttons */}
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => {
              setStartDate("");
              setEndDate("");
            }}
            className="btn btn-secondary"
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
          >
            ทั้งหมด
          </button>
          <button 
            onClick={() => {
                const today = new Date();
                const formatted = today.toISOString().split('T')[0]; // YYYY-MM-DD
                setStartDate(formatted);
                setEndDate(formatted);

            }}
            className="btn btn-secondary"
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
          >
            วันนี้
          </button>
          <button 
            onClick={() => {
                const today = new Date();
                const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                setStartDate(weekAgo.toISOString().split('T')[0]);
                setEndDate(new Date().toISOString().split('T')[0]);
            }}
            className="btn btn-secondary"
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
          >
            7 วันที่ผ่านมา
          </button>
          <button 
            onClick={() => {
                const today = new Date();
                const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                setStartDate(monthAgo.toISOString().split('T')[0]);
                setEndDate(new Date().toISOString().split('T')[0]);

            }}
            className="btn btn-secondary"
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
          >
            30 วันที่ผ่านมา
          </button>
          <button 
            onClick={() => {
            const today = new Date();
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
            setStartDate(firstDay.toISOString().split('T')[0]);
            setEndDate(new Date().toISOString().split('T')[0]);

            }}
            className="btn btn-secondary"
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
          >
            เดือนนี้
          </button>
        </div>
        </div>

      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-content">
            <div className="stat-info">
              <h3>รายจ่ายทั้งหมด</h3>
              <p>{totalExpenses.toLocaleString()} บาท</p>
            </div>
            <div className="stat-icon">
              <Wallet size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-content">
            <div className="stat-info">
              <h3>หมวดหมู่</h3>
              <p>{summary.length} หมวด</p>
            </div>
            <div className="stat-icon">
              <BarChart3 size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-content">
            <div className="stat-info">
              <h3>รายการ</h3>
              <p>{expenses.length} รายการ</p>
            </div>
            <div className="stat-icon">
              <Calendar size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="card">
          <div className="card-header">
            <div className="card-icon blue">
              <TrendingUp size={20} />
            </div>
            <h3 className="card-title">ค่าเฉลี่ยต่อรายการ</h3>
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#2563eb' }}>
            {averageExpense.toLocaleString()} บาท
          </p>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-icon green">
              <BarChart3 size={20} />
            </div>
            <h3 className="card-title">หมวดหมู่สูงสุด</h3>
          </div>
          <p style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: '#059669' }}>
            {highestCategory.name || "ไม่มีข้อมูล"}
          </p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
            {highestCategory.value ? `${highestCategory.value.toLocaleString()} บาท` : ""}
          </p>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-icon purple">
              <Calendar size={20} />
            </div>
            <h3 className="card-title">ช่วงเวลา</h3>
          </div>
            <p style={{
            fontSize: '0.875rem',
            color: '#374151',
            margin: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
            }}>
            <span>
                {startDate && endDate 
                ? `${new Date(startDate).toLocaleDateString('th-TH')} - ${new Date(endDate).toLocaleDateString('th-TH')}`
                : startDate 
                    ? `ตั้งแต่ ${new Date(startDate).toLocaleDateString('th-TH')}`
                    : endDate
                    ? `จนถึง ${new Date(endDate).toLocaleDateString('th-TH')}`
                    : "ทั้งหมด"}
            </span>
            <span 
                style={{ fontSize: '1rem', color: '#3b82f6', cursor: 'pointer', marginLeft: '0.5rem' }}
                onClick={() => setShowPopup(true)}
            >
                ดูรายการ
            </span>
            </p>
        </div>
      </div>

      <div className="grid-2">
        
        <div className="card">
          <h3 className="card-title" style={{marginBottom: '1.5rem'}}>การแจกแจงรายจ่าย</h3>
          {isLoading ? (
            <div className="loading">
              <p>กำลังโหลดข้อมูล...</p>
            </div>
          ) : summary.length === 0 ? (
            <div className="empty-state">
              <h3>ไม่มีข้อมูล</h3>
              <p>ไม่พบรายจ่ายในช่วงเวลาที่เลือก</p>
            </div>
          ) : (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {summary.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value.toLocaleString()} บาท`, 'จำนวนเงิน']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="card-title" style={{marginBottom: '1.5rem'}}>ยอดรวมตามหมวดหมู่</h3>
          {isLoading ? (
            <div className="loading">
              <p>กำลังโหลดข้อมูล...</p>
            </div>
          ) : summary.length === 0 ? (
            <div className="empty-state">
              <h3>ไม่มีข้อมูล</h3>
              <p>ไม่พบรายจ่ายในช่วงเวลาที่เลือก</p>
            </div>
          ) : (
            <div className="category-list">
              {summary
                .sort((a, b) => b.value - a.value) // เรียงจากมากไปน้อย
                .map((item, index) => (
                <div key={item.name} className="category-item">
                  <div className="category-info">
                    <div
                      className="color-dot"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="category-name">{item.name}</span>
                  </div>
                  <div className="category-amount">
                    <p className="amount">{item.value.toLocaleString()} บาท</p>
                    <p className="percentage">
                      {totalExpenses > 0 ? ((item.value / totalExpenses) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>


    </div>
  );
}

export default Dashboard;