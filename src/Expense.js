import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function Expense() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
    const [sortOption, setSortOption] = useState("date_desc");
    const [showAll, setShowAll] = useState(false);

    const fetchExpenses = async () => {
        setIsLoading(true);
        try {
            let query = supabase.from("expenses").select("*");

       
            if (startDate && endDate) {
            query = query
                .gte("date", `${startDate}T00:00:00.000Z`)
                .lte("date", `${endDate}T23:59:59.999Z`);
            } else if (startDate) {
            query = query.gte("date", startDate);
            } else if (endDate) {
            query = query.lte("date", endDate);
            }

        
            switch (sortOption) {
            case "date_asc":
                query = query.order("date", { ascending: true });
                break;
            case "title_asc":
                query = query.order("title", { ascending: true });
                break;
            case "title_desc":
                query = query.order("title", { ascending: false });
                break;
            case "amount_desc":
                query = query.order("amount", { ascending: false });
                break;
            case "amount_asc":
                query = query.order("amount", { ascending: true });
                break;
            default:
                query = query.order("date", { ascending: false }); 
            }

            let { data, error } = await query;

            if (error) {
            console.error("Fetch error:", error.message);
            setExpenses([]);
            } else {
            setExpenses(data ?? []);
            }
        } catch (err) {
            console.error(err);
            setExpenses([]);
        } finally {
            setIsLoading(false);
        }
        };


  const addExpense = async () => {
    if (!title || !amount || !category) return alert("กรอกข้อมูลให้ครบ");

    setIsLoading(true);
    try {

        await supabase.from("expenses").insert([
        {
            title,
            amount: parseFloat(amount),
            category,
            date: new Date().toISOString(), 
        },
        ]);

      setTitle("");
      setAmount("");
      setCategory("");
      fetchExpenses();
    } finally {
      setIsLoading(false);
    }
  };

    useEffect(() => {
    fetchExpenses();
    }, [startDate, endDate, sortOption]);


  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "28px",textAlign:"center", fontWeight: "bold", marginBottom: "20px" }}> Expense Tracker</h1>

      {/* Add Expense Form */}
      <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "10px", marginBottom: "15px", alignItems: "center" }}>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ชื่อรายการ"
            disabled={isLoading}
            style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", outline: "none" }}
        />
            <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="จำนวนเงิน (บาท)"
            min="0"
            step="0.01"
            disabled={isLoading}
            style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", outline: "none" }}
            onKeyDown={(e) => {
                if (e.key === "-" || e.key === "+") {
                e.preventDefault();
                }
            }}
            onInput={(e) => {
                if (e.target.value < 0) {
                e.target.value = 0; 
                }
            }}
            />

        <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isLoading}
            style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", outline: "none" }}
        >
            <option value="">เลือกหมวดหมู่</option>
            <option value="อาหาร">🍽️ อาหาร</option>
            <option value="เครื่องดื่ม">🥤 เครื่องดื่ม</option>
            <option value="เดินทาง">🚗 เดินทาง</option>
            <option value="ซื้อของ">🛒 ซื้อของ</option>
            <option value="บันเทิง">🎬 บันเทิง</option>
            <option value="สุขภาพ">🏥 สุขภาพ</option>
            <option value="การศึกษา">📚 การศึกษา</option>
            <option value="บิล/ค่าใช้จ่าย">🧾 บิล/ค่าใช้จ่าย</option>
            <option value="อื่นๆ">📦 อื่นๆ</option>
        </select>
        <button
            onClick={addExpense}
            disabled={isLoading}
            style={{
            padding: "12px",
            borderRadius: "8px",
            backgroundColor: isLoading ? "#9ca3af" : "#3b82f6",
            color: "#fff",
            fontWeight: "600",
            cursor: isLoading ? "not-allowed" : "pointer",
            transition: "background-color 0.3s",
            }}
        >
            {isLoading ? "กำลังบันทึก..." : " บันทึกรายการ"}
        </button>
        </div>
      </div>

      {/* Date Filter */}
                <div
                style={{
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    padding: "20px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    marginBottom: "20px",
                }}
                >
                <div
                    style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "20px",
                    }}
                >
                    <div>
                    <h3 style={{ fontWeight: "600", marginBottom: "10px" }}>Filter ช่วงเวลา</h3>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        style={{
                            padding: "10px",
                            borderRadius: "8px",
                            border: "1px solid #d1d5db",
                        }}
                        />
                        <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        style={{
                            padding: "10px",
                            borderRadius: "8px",
                            border: "1px solid #d1d5db",
                        }}
                        />
                        <button
                        onClick={fetchExpenses}
                        style={{
                            padding: "10px 15px",
                            borderRadius: "8px",
                            backgroundColor: "#3b82f6",
                            color: "#fff",
                            fontWeight: "600",
                            cursor: "pointer",
                        }}
                        >
                        Apply
                        </button>
                    </div>
                    </div>

                    <div style={{ minWidth: "200px" }}>
                    <label style={{ marginRight: "10px", fontWeight: "600" }}>Sort by:</label>
                    <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        style={{
                        padding: "6px",
                        borderRadius: "6px",
                        border: "1px solid #d1d5db",
                        }}
                    >
                        <option value="date_desc">📅 วันที่ล่าสุด</option>
                        <option value="date_asc">📅 วันที่เก่าไปใหม่</option>
                        <option value="title_asc">🔤 ชื่อ (A-Z/ก-ฮ)</option>
                        <option value="title_desc">🔤 ชื่อ (Z-A/ฮ-ก)</option>
                        <option value="amount_desc">💸 จำนวนเงินมากสุด</option>
                        <option value="amount_asc">💸 จำนวนเงินน้อยสุด</option>
                    </select>
                    </div>
                </div>
                </div>


      

      {/* Expense List */}
      
        <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "15px" }}>รายการล่าสุด</h2>

        {isLoading ? (
            <p>กำลังโหลดข้อมูล...</p>
        ) : expenses.length === 0 ? (
            <p>ยังไม่มีรายการ</p>
        ) : (
            <>
            <ul style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {(showAll ? expenses : expenses.slice(0, 3)).map((e) => (
                <li
                    key={e.expense_id}
                    style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "12px",
                    borderRadius: "8px",
                    backgroundColor: "#f9fafb",
                    }}
                >
                    <div>
                    <p style={{ fontWeight: "600", color: "#111827" }}>{e.title}</p>
                        <p style={{ fontSize: "12px", color: "#6b7280" }}>
                        {e.category} | {new Date(e.date).toLocaleDateString("th-TH")}
                        </p>
                    </div>
                    <div style={{ color: "#ef4444", fontWeight: "600" }}>-{e.amount.toLocaleString()} บาท</div>
                </li>
                ))}
            </ul>

            {/* ปุ่มดูเพิ่มเติม */}
            {expenses.length > 3 && (
                <button
                onClick={() => setShowAll(!showAll)}
                style={{
                    display: "block",
                    margin: "0 auto",
                    marginTop: "10px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    backgroundColor: "#3b82f6",
                    color: "#fff",
                    fontWeight: "600",
                    cursor: "pointer",
                }}
                >
                {showAll ? "ซ่อน" : `ดูเพิ่มเติม (${expenses.length - 3} รายการ)`}
                </button>
            )}
            </>
        )}
        </div>
    </div>
  );
}

export default Expense;
