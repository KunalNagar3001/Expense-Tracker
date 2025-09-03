import React,{useState,useEffect} from "react"
import Sidebar from "../Dashboard/Sidebar"
import { GoogleGenerativeAI } from "@google/generative-ai"
// import html2pdf from "html2pdf.js" // Commented out due to issues
import jsPDF from "jspdf"
// import { useLocation } from 'react-router-dom'
import './Analytics.css' 

export default function Analytics() {
    const [data,setData]=useState([])
    const [isGenerating, setIsGenerating] = useState(false)
    const [reportData, setReportData] = useState(null)
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'
    
    // Initialize Google Gemini AI
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyDa0RUGGCdZreiNSedoZlssNzXohX3FfRY')

    useEffect(
        ()=>{
            fetchAllExpensesA();
        },[]
    )

    const fetchAllExpensesA=async ()=>{
        try{
            const token=localStorage.getItem('token');
            const response=await fetch(`${API_BASE_URL}/api/allexpenses`,{
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            if(!response.ok) throw new Error('Failed to fetch all expenses');
            const data1=await response.json();
            console.log(data1)
            setData(Array.isArray(data1) ? data1 : []);

        }
        catch(err){
            setData([]);
        }
    }

    const generateAIReport = async (expenses) => {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
            
            const prompt = `Analyze the following expense data and provide insights in this exact JSON format:
            {
                "summary": {
                    "totalExpenses": number,
                    "averageExpense": number,
                    "totalCategories": number,
                    "dateRange": "string"
                },
                "categoryBreakdown": [
                    {
                        "category": "string",
                        "total": number,
                        "percentage": number,
                        "count": number
                    }
                ],
                "insights": [
                    "string insight 1",
                    "string insight 2",
                    "string insight 3"
                ],
                "recommendations": [
                    "string recommendation 1",
                    "string recommendation 2",
                    "string recommendation 3"
                ]
            }

            Expense data: ${JSON.stringify(expenses)}
            
            Provide only the JSON response, no additional text.`

            const result = await model.generateContent(prompt)
            const response = await result.response
            const text = response.text()
            
            // Extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0])
            } else {
                throw new Error('Invalid AI response format')
            }
        } catch (error) {
            console.error('AI generation error:', error)
            throw error
        }
    }

    const createPDFWithJsPDF = (reportData, expenses) => {
        const doc = new jsPDF()
        
        // Page dimensions and margins
        const pageHeight = doc.internal.pageSize.height
        const margin = 20
        const maxY = pageHeight - margin
        let yPos = margin
        
        // Helper function to add new page if needed
        const addPageIfNeeded = (requiredSpace = 20) => {
            if (yPos + requiredSpace > maxY) {
                doc.addPage()
                yPos = margin
                return true
            }
            return false
        }
        
        // Title
        doc.setFontSize(24)
        doc.setTextColor(37, 99, 235) // Blue color
        doc.text('Expense Analysis Report', 105, yPos, { align: 'center' })
        yPos += 15
        
        doc.setFontSize(12)
        doc.setTextColor(107, 114, 128) // Gray color
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, yPos, { align: 'center' })
        yPos += 20
        
        // Executive Summary
        addPageIfNeeded(30)
        doc.setFontSize(18)
        doc.setTextColor(31, 41, 55)
        doc.text('Executive Summary', margin, yPos)
        yPos += 15
        
        doc.setFontSize(12)
        doc.setTextColor(75, 85, 99)
        
        // Summary grid
        const summaryData = [
            ['Total Expenses', `$${reportData.summary.totalExpenses.toFixed(2)}`],
            ['Average Expense', `$${reportData.summary.averageExpense.toFixed(2)}`],
            ['Categories', `${reportData.summary.totalCategories}`],
            ['Date Range', reportData.summary.dateRange]
        ]
        
        summaryData.forEach(([label, value], index) => {
            addPageIfNeeded(15)
            const xPos = margin + (index % 2) * 85
            if (index % 2 === 0 && index > 0) yPos += 15
            
            doc.setFontSize(10)
            doc.setTextColor(107, 114, 128)
            doc.text(label, xPos, yPos)
            
            doc.setFontSize(14)
            doc.setTextColor(31, 41, 55)
            doc.text(value, xPos, yPos + 8)
        })
        
        // Spending Patterns Analysis
        addPageIfNeeded(40)
        yPos += 25
        doc.setFontSize(18)
        doc.setTextColor(31, 41, 55)
        doc.text('Spending Patterns Analysis', margin, yPos)
        
        // Calculate additional insights
        const totalAmount = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0)
        const avgAmount = totalAmount / expenses.length
        const highestExpense = Math.max(...expenses.map(exp => Number(exp.amount)))
        const lowestExpense = Math.min(...expenses.map(exp => Number(exp.amount)))
        
        yPos += 15
        doc.setFontSize(12)
        doc.setTextColor(75, 85, 99)
        
        addPageIfNeeded(25)
        doc.text('💰 Expense Range:', margin, yPos)
        yPos += 8
        doc.setFontSize(10)
        doc.text(`   Highest: $${highestExpense.toFixed(2)}`, margin + 5, yPos)
        yPos += 6
        doc.text(`   Lowest: $${lowestExpense.toFixed(2)}`, margin + 5, yPos)
        yPos += 6
        doc.text(`   Variance: $${(highestExpense - lowestExpense).toFixed(2)}`, margin + 5, yPos)
        
        yPos += 10
        addPageIfNeeded(25)
        doc.setFontSize(12)
        doc.text('📊 Spending Distribution:', margin, yPos)
        yPos += 8
        doc.setFontSize(10)
        doc.text(`   Total Transactions: ${expenses.length}`, margin + 5, yPos)
        yPos += 6
        doc.text(`   Average per Transaction: $${avgAmount.toFixed(2)}`, margin + 5, yPos)
        yPos += 6
        doc.text(`   Standard Deviation: $${calculateStandardDeviation(expenses).toFixed(2)}`, margin + 5, yPos)
        
        // Monthly Spending Trends
        addPageIfNeeded(30)
        yPos += 15
        doc.setFontSize(18)
        doc.setTextColor(31, 41, 55)
        doc.text('Monthly Spending Trends', margin, yPos)
        
        // Get monthly spending data
        const monthlySpending = {}
        expenses.forEach(exp => {
            const month = new Date(exp.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
            monthlySpending[month] = (monthlySpending[month] || 0) + Number(exp.amount)
        })
        
        const topMonths = Object.entries(monthlySpending)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
        
        yPos += 15
        doc.setFontSize(12)
        doc.setTextColor(75, 85, 99)
        
        topMonths.forEach(([month, amount], index) => {
            addPageIfNeeded(8)
            doc.text(`${month}: $${amount.toFixed(2)}`, margin + 5, yPos)
            yPos += 6
        })
        
        // Category Performance Analysis
        addPageIfNeeded(40)
        yPos += 10
        doc.setFontSize(18)
        doc.setTextColor(31, 41, 55)
        doc.text('Category Performance Analysis', margin, yPos)
        
        const categoryInsights = reportData.categoryBreakdown
            .sort((a, b) => b.total - a.total)
            .map((cat, index) => ({
                ...cat,
                rank: index + 1,
                trend: cat.percentage > 20 ? 'High' : cat.percentage > 10 ? 'Medium' : 'Low'
            }))
        
        yPos += 15
        doc.setFontSize(12)
        doc.setTextColor(75, 85, 99)
        
        categoryInsights.forEach((cat, index) => {
            addPageIfNeeded(15)
            doc.text(`#${cat.rank} ${cat.category} (${cat.trend} Spending)`, margin + 5, yPos)
            yPos += 6
            doc.setFontSize(10)
            doc.text(`   $${cat.total.toFixed(2)} (${cat.percentage.toFixed(1)}%) - ${cat.count} expenses`, margin + 10, yPos)
            yPos += 8
            doc.setFontSize(12)
        })
        
        // AI-Generated Insights
        addPageIfNeeded(30)
        yPos += 10
        doc.setFontSize(18)
        doc.setTextColor(31, 41, 55)
        doc.text('AI-Generated Insights', margin, yPos)
        
        yPos += 15
        doc.setFontSize(12)
        doc.setTextColor(75, 85, 99)
        
        reportData.insights.forEach((insight, index) => {
            addPageIfNeeded(10)
            doc.text(`💡 ${insight}`, margin + 5, yPos)
            yPos += 8
        })
        
        // Strategic Recommendations
        addPageIfNeeded(30)
        yPos += 10
        doc.setFontSize(18)
        doc.setTextColor(31, 41, 55)
        doc.text('Strategic Recommendations', margin, yPos)
        
        yPos += 15
        doc.setFontSize(12)
        doc.setTextColor(75, 85, 99)
        
        reportData.recommendations.forEach((rec, index) => {
            addPageIfNeeded(10)
            doc.text(`✅ ${rec}`, margin + 5, yPos)
            yPos += 8
        })
        
        // Financial Health Assessment
        addPageIfNeeded(50)
        yPos += 15
        doc.setFontSize(18)
        doc.setTextColor(31, 41, 55)
        doc.text('Financial Health Assessment', margin, yPos)
        
        yPos += 15
        doc.setFontSize(12)
        doc.setTextColor(75, 85, 99)
        
        const healthTips = [
            '🎯 Budget Management: Set category-specific budgets for high-spending areas',
            '📈 Savings Opportunities: Optimize recurring expenses to increase savings',
            '🔍 Expense Tracking: Monitor spending habits for better decisions',
            '💡 Smart Spending: Look for deals and consolidation opportunities'
        ]
        
        healthTips.forEach((tip, index) => {
            addPageIfNeeded(10)
            doc.text(tip, margin + 5, yPos)
            yPos += 8
        })
        
        // Footer
        addPageIfNeeded(25)
        yPos += 20
        doc.setFontSize(10)
        doc.setTextColor(107, 114, 128)
        doc.text('Report generated by Expense Tracker Analytics | AI-Powered Financial Insights', 105, yPos, { align: 'center' })
        
        return doc
    }

    // Helper function to calculate standard deviation
    const calculateStandardDeviation = (expenses) => {
        const amounts = expenses.map(exp => Number(exp.amount));
        const mean = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
        const squaredDiffs = amounts.map(amount => Math.pow(amount - mean, 2));
        const avgSquaredDiff = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / squaredDiffs.length;
        return Math.sqrt(avgSquaredDiff);
    }

    const handleGenerateReport = async () => {
        if (data.length === 0) {
            alert('No expenses data available to generate report')
            return
        }
        
        setIsGenerating(true)
        try {
            // Generate AI report
            const aiReport = await generateAIReport(data)
            setReportData(aiReport)
            
            // Create and download PDF using jsPDF
            const pdfDoc = createPDFWithJsPDF(aiReport, data)
            pdfDoc.save(`expense_analysis_report_${new Date().toISOString().slice(0, 10)}.pdf`)
            
            alert('Report generated and downloaded successfully!')
        } catch (error) {
            console.error('Report generation failed:', error)
            alert('Failed to generate report. Please try again.')
        } finally {
            setIsGenerating(false)
        }
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
                        <button 
                            className="analytics-action-button" 
                            onClick={handleGenerateReport}
                            disabled={isGenerating || data.length === 0}
                        >
                            {isGenerating ? 'Generating Report...' : 'Generate Report'}
                        </button>
                    </div>
                    
                    <div className="Analytics-content">
                        <h1>This is the analytics page</h1>
                        <div>
                            Total expenses available: {data.length}
                        </div>
                        
                        {reportData && (
                            <div className="report-preview">
                                <h2>Report Preview</h2>
                                <div className="report-summary">
                                    <h3>Summary</h3>
                                    <p>Total: ${reportData.summary.totalExpenses.toFixed(2)}</p>
                                    <p>Average: ${reportData.summary.averageExpense.toFixed(2)}</p>
                                    <p>Categories: {reportData.summary.totalCategories}</p>
                                </div>
                                
                                <div className="report-insights">
                                    <h3>Key Insights</h3>
                                    <ul>
                                        {reportData.insights.map((insight, index) => (
                                            <li key={index}>{insight}</li>
                                        ))}
                                    </ul>
                                </div>
                                
                                <div className="report-recommendations">
                                    <h3>Recommendations</h3>
                                    <ul>
                                        {reportData.recommendations.map((rec, index) => (
                                            <li key={index}>{rec}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}