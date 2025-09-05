import React, { useState, useEffect } from "react"
import Sidebar from "../Dashboard/Sidebar"
import { GoogleGenerativeAI } from "@google/generative-ai"
import jsPDF from "jspdf"
import './Analytics.css'

export default function Analytics() {
    const [data, setData] = useState([])
    const [filteredData, setFilteredData] = useState([])
    const [isGenerating, setIsGenerating] = useState(false)
    const [aiRawResponse, setAiRawResponse] = useState('')
    const [selectedMonth, setSelectedMonth] = useState('')
    const [selectedWeek, setSelectedWeek] = useState('')
    const [filterType, setFilterType] = useState('all') // 'all', 'month', 'week'
    
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'
    
    // Initialize Google Gemini AI
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '')

    useEffect(() => {
        fetchAllExpensesA();
    }, [])

    useEffect(() => {
        filterData();
    }, [data, selectedMonth, selectedWeek, filterType])

    const fetchAllExpensesA = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/allexpenses`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            if (!response.ok) throw new Error('Failed to fetch all expenses');
            const data1 = await response.json();
            console.log(data1)
            setData(Array.isArray(data1) ? data1 : []);
        }
        catch (err) {
            setData([]);
        }
    }

    const filterData = () => {
        if (filterType === 'all') {
            setFilteredData(data);
            return;
        }

        let filtered = [...data];

        if (filterType === 'month' && selectedMonth) {
            filtered = data.filter(expense => {
                const expenseDate = new Date(expense.date || expense.createdAt);
                const expenseMonth = expenseDate.getFullYear() + '-' + String(expenseDate.getMonth() + 1).padStart(2, '0');
                return expenseMonth === selectedMonth;
            });
        }

        if (filterType === 'week' && selectedWeek) {
            const [year, week] = selectedWeek.split('-W');
            const startOfWeek = getStartOfWeek(parseInt(year), parseInt(week));
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);

            filtered = data.filter(expense => {
                const expenseDate = new Date(expense.date || expense.createdAt);
                return expenseDate >= startOfWeek && expenseDate <= endOfWeek;
            });
        }

        setFilteredData(filtered);
    }

    const getStartOfWeek = (year, week) => {
        const jan1 = new Date(year, 0, 1);
        const days = (week - 1) * 7;
        const startOfWeek = new Date(jan1.getTime() + days * 24 * 60 * 60 * 1000);
        const dayOfWeek = startOfWeek.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        startOfWeek.setDate(startOfWeek.getDate() + mondayOffset);
        return startOfWeek;
    }

    const generateAiRawText = async (expenses) => {
        try {
            if (!import.meta.env.VITE_GEMINI_API_KEY) {
                throw new Error('Missing Gemini API key (VITE_GEMINI_API_KEY)')
            }
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
            
            let periodInfo = '';
            if (filterType === 'month' && selectedMonth) {
                const [year, month] = selectedMonth.split('-');
                const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
                periodInfo = `for ${monthName} ${year}`;
            } else if (filterType === 'week' && selectedWeek) {
                periodInfo = `for week ${selectedWeek}`;
            } else {
                periodInfo = 'for all time';
            }
            
            const prompt = `You are a financial analyst. Analyze the following expense data ${periodInfo} and return a comprehensive textual report with:
            - Executive summary
            - Total expenses and average per transaction
            - Category breakdown with percentages and amounts
            - Top spending categories
            - Notable patterns and insights
            - Financial recommendations and money-saving tips
            
            Format the response as a professional financial report with clear sections and bullet points where appropriate.
            Keep it plain text (no JSON, no markdown fences).
            
            EXPENSE_DATA: ${JSON.stringify(expenses)}`

            const result = await model.generateContent(prompt)
            const response = await result.response
            const text = response.text()
            console.debug('Raw AI response:', text)
            return text
        } catch (error) {
            console.error('AI generation error:', error)
            throw error
        }
    }

    const generatePDF = (reportText) => {
        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.height;
        const margin = 20;
        const lineHeight = 7;
        let yPosition = margin;

        // Add title
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        
        let title = 'Expense Analysis Report';
        if (filterType === 'month' && selectedMonth) {
            const [year, month] = selectedMonth.split('-');
            const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
            title += ` - ${monthName} ${year}`;
        } else if (filterType === 'week' && selectedWeek) {
            title += ` - Week ${selectedWeek}`;
        }
        
        doc.text(title, margin, yPosition);
        yPosition += lineHeight * 2;

        // Add generated date
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPosition);
        yPosition += lineHeight * 2;

        // Add content
        doc.setFontSize(11);
        const lines = reportText.split('\n');
        
        lines.forEach(line => {
            // Check if we need a new page
            if (yPosition > pageHeight - margin) {
                doc.addPage();
                yPosition = margin;
            }

            // Handle long lines by splitting them
            const maxWidth = doc.internal.pageSize.width - 2 * margin;
            const wrappedLines = doc.splitTextToSize(line || ' ', maxWidth);
            
            wrappedLines.forEach(wrappedLine => {
                if (yPosition > pageHeight - margin) {
                    doc.addPage();
                    yPosition = margin;
                }
                doc.text(wrappedLine, margin, yPosition);
                yPosition += lineHeight;
            });
        });

        return doc;
    }

    const handleGenerateReport = async () => {
        if (filteredData.length === 0) {
            alert('No expenses data available for the selected period to generate report')
            return
        }
        
        setIsGenerating(true)
        try {
            const raw = await generateAiRawText(filteredData)
            setAiRawResponse(raw || '')
        } catch (error) {
            console.error('Report generation failed:', error)
            alert('Failed to generate AI report. Check console for details.')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleDownloadPDF = () => {
        if (!aiRawResponse) {
            alert('Please generate a report first')
            return
        }

        const doc = generatePDF(aiRawResponse);
        
        let filename = 'expense-analysis-report';
        if (filterType === 'month' && selectedMonth) {
            filename += `-${selectedMonth}`;
        } else if (filterType === 'week' && selectedWeek) {
            filename += `-${selectedWeek}`;
        }
        filename += '.pdf';

        doc.save(filename);
    }

    const getCurrentMonth = () => {
        const now = new Date();
        return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    }

    const getCurrentWeek = () => {
        const now = new Date();
        const year = now.getFullYear();
        const jan1 = new Date(year, 0, 1);
        const days = Math.floor((now - jan1) / (24 * 60 * 60 * 1000));
        const week = Math.ceil((days + jan1.getDay() + 1) / 7);
        return `${year}-W${String(week).padStart(2, '0')}`;
    }

    return (
        <>
            <div className="Analytics-Page">
                <Sidebar />
                <div className="Analytics-Container">
                    <div className="Analytics-header">
                        <div className="Analytics-header-left">
                            <h1 className="Analytics-title">Analytics</h1>
                            <div className="Analytics-subHeader">
                                Spend Smarter: Your Expense Analysis
                            </div>
                        </div>
                        <div className="analytics-actions">
                            <button 
                                className="analytics-action-button" 
                                onClick={handleGenerateReport}
                                disabled={isGenerating || filteredData.length === 0}
                            >
                                {isGenerating ? 'Generating Report...' : 'Generate Report'}
                            </button>
                            {aiRawResponse && (
                                <button 
                                    className="analytics-action-button analytics-download-button" 
                                    onClick={handleDownloadPDF}
                                >
                                    Download PDF
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {/* Filter Controls */}
                    <div className="filter-controls">
                        <h3 className="filter-title">Filter Options</h3>
                        <div className="filter-options">
                            <div className="filter-option">
                                <label className="filter-label">
                                    <input
                                        type="radio"
                                        name="filterType"
                                        value="all"
                                        checked={filterType === 'all'}
                                        onChange={(e) => setFilterType(e.target.value)}
                                        className="filter-radio"
                                    />
                                    <span className="filter-text">All Time</span>
                                </label>
                            </div>
                            
                            <div className="filter-option">
                                <label className="filter-label">
                                    <input
                                        type="radio"
                                        name="filterType"
                                        value="month"
                                        checked={filterType === 'month'}
                                        onChange={(e) => setFilterType(e.target.value)}
                                        className="filter-radio"
                                    />
                                    <span className="filter-text">Monthly</span>
                                </label>
                                {filterType === 'month' && (
                                    <input
                                        type="month"
                                        value={selectedMonth || getCurrentMonth()}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        className="filter-date-input"
                                    />
                                )}
                            </div>
                            
                            <div className="filter-option">
                                <label className="filter-label">
                                    <input
                                        type="radio"
                                        name="filterType"
                                        value="week"
                                        checked={filterType === 'week'}
                                        onChange={(e) => setFilterType(e.target.value)}
                                        className="filter-radio"
                                    />
                                    <span className="filter-text">Weekly</span>
                                </label>
                                {filterType === 'week' && (
                                    <input
                                        type="week"
                                        value={selectedWeek || getCurrentWeek()}
                                        onChange={(e) => setSelectedWeek(e.target.value)}
                                        className="filter-date-input"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="Analytics-content">
                        {/* <h1>Analytics Dashboard</h1> */}
                        <div style={{ marginBottom: '1rem' }}>
                            {/* <strong>Total expenses available:</strong> {data.length} */}
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            {/* <strong>Filtered expenses:</strong> {filteredData.length} */}
                            {filterType === 'month' && selectedMonth && (
                                <span style={{ marginLeft: '0.5rem', color: '#6b7280' }}>
                                    ({selectedMonth})
                                </span>
                            )}
                            {filterType === 'week' && selectedWeek && (
                                <span style={{ marginLeft: '0.5rem', color: '#6b7280' }}>
                                    (Week {selectedWeek})
                                </span>
                            )}
                        </div>
                        
                        {aiRawResponse && (
                            <div className="report-preview" style={{ marginTop: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h2>AI Generated Report</h2>
                                </div>
                                <pre style={{ 
                                    whiteSpace: 'pre-wrap', 
                                    background: '#f9fafb', 
                                    padding: '12px', 
                                    borderRadius: '6px', 
                                    border: '1px solid #e5e7eb', 
                                    maxHeight: '70vh', 
                                    overflow: 'auto',
                                    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                                    fontSize: '14px',
                                    lineHeight: '1.5'
                                }}>
{aiRawResponse}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
