import React, { useState, useEffect } from 'react';
import Sidebar from '../Dashboard/Sidebar';
import AddSavingsForm from './AddSavingsForm';
import SavingsCard from './SavingsCard';
import UpdateAmountModal from './UpdateAmountModal';
import EditSavingsModal from './EditSavingsModal';
import './Savings.css';

const Savings = () => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [showUpdateAmountModal, setShowUpdateAmountModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedSavings, setSelectedSavings] = useState(null);
    const [savings, setSavings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_BASE_URL = 'http://localhost:5001';

    // Fetch savings data
    const fetchSavings = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/savings`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch savings');
            }
            
            const data = await response.json();
            setSavings(data);
        } catch (err) {
            setError('Failed to load savings goals');
            console.error('Error fetching savings:', err);
        } finally {
            setLoading(false);
        }
    };

    // Load savings on component mount
    useEffect(() => {
        fetchSavings();
    }, []);

    const handleSavingsAdded = () => {
        setShowAddForm(false);
        fetchSavings(); // Refresh the list
    };

    // Handle update amount
    const handleUpdateAmount = (id) => {
        const saving = savings.find(s => s._id === id);
        setSelectedSavings(saving);
        setShowUpdateAmountModal(true);
    };

    // Handle edit savings
    const handleEdit = (saving) => {
        setSelectedSavings(saving);
        setShowEditModal(true);
    };

    // Handle modal updates
    const handleUpdateAmountSuccess = (updatedSavings) => {
        setShowUpdateAmountModal(false);
        setSelectedSavings(null);
        fetchSavings(); // Refresh the list
    };

    const handleEditSuccess = (updatedSavings) => {
        setShowEditModal(false);
        setSelectedSavings(null);
        fetchSavings(); // Refresh the list
    };

    // Handle delete savings
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this savings goal?')) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/api/savings/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to delete savings goal');
                }
                
                fetchSavings(); // Refresh the list
            } catch (err) {
                setError('Failed to delete savings goal');
                console.error('Error deleting savings:', err);
            }
        }
    };

    return (
        <>
            <div className="Savings-page">
                <Sidebar />
                <div className="Savings-container" style={{ color: '#111827' }}>
                    <div className="Savings-header">
                        <h1 className="Savings-title">Savings Goals</h1>
                        <button 
                            className="add-savings-button"
                            onClick={() => setShowAddForm(true)}
                        >
                            + Add Savings Goal
                        </button>
                    </div>
                    <div className="Savings-content">
                        {loading ? (
                            <div className="Savings-loading">
                                <p>Loading savings goals...</p>
                            </div>
                        ) : error ? (
                            <div className="Savings-error">
                                <p>{error}</p>
                                <button onClick={fetchSavings} className="retry-button">
                                    Try Again
                                </button>
                            </div>
                        ) : savings.length === 0 ? (
                            <div className="Savings-empty">
                                <p>No savings goals yet. Create your first one!</p>
                            </div>
                        ) : (
                            <div className="Savings-grid">
                                {savings.map((saving) => (
                                    <SavingsCard
                                        key={saving._id}
                                        savings={saving}
                                        onUpdateAmount={(id) => handleUpdateAmount(id)}
                                        onEdit={(saving) => handleEdit(saving)}
                                        onDelete={(id) => handleDelete(id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {showAddForm && (
                <AddSavingsForm
                    API_BASE_URL={API_BASE_URL}
                    onSavingsAdded={handleSavingsAdded}
                    onCancel={() => setShowAddForm(false)}
                />
            )}

            {showUpdateAmountModal && selectedSavings && (
                <UpdateAmountModal
                    savings={selectedSavings}
                    onUpdate={handleUpdateAmountSuccess}
                    onCancel={() => {
                        setShowUpdateAmountModal(false);
                        setSelectedSavings(null);
                    }}
                />
            )}

            {showEditModal && selectedSavings && (
                <EditSavingsModal
                    savings={selectedSavings}
                    onUpdate={handleEditSuccess}
                    onCancel={() => {
                        setShowEditModal(false);
                        setSelectedSavings(null);
                    }}
                />
            )}
        </>
    );
};
export default Savings;