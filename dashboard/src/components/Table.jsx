import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';


const Table = ({ selectedMonth, onPageChange }) => {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/transactions', {
        params: { search, page, perPage: 10 },
      });
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [search, page]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to the first page
  };

  const handlePageChange = (direction) => {
    setPage((prev) => prev + direction);
  };

  return (
    <div className='m-3'>
      <div className='d-flex flex-row justify-content-evenly'>
        <div className='d-flex flex-row ' style={{width:"50%"}}>
        <label className='m-2 fw-bolder ml-5' htmlFor="month">Select Month:</label>
        <select className='' style={{width:"30%"}} id="month" value={selectedMonth} onChange={(e) => {onPageChange(e.target.value); } }>
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(
            (month, index) => (
              <option key={index} value={String(index + 1).padStart(2, '0')}>
                {month}
              </option>
            )
          )}
        </select>
        </div>
        
        <div>
        <input
        type="text"
        placeholder="Search transactions..."
        value={search}
        onChange={handleSearchChange}
        style={{width:"120%",height:"110%"}}
      />
        </div>
      </div>
      
      <table className="table table-striped mt-3">
        <thead className='table-dark'>
          <tr className='bg-info'>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
            <th>Date of Sale</th>
            <th>Sold</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.title}</td>
              <td>{transaction.description}</td>
              <td>{transaction.price}</td>
              <td>{transaction.dateOfSale}</td>
              <td>{transaction.sold ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      


      {/* <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
            <th>Date of Sale</th>
            <th>Sold</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.title}</td>
              <td>{transaction.description}</td>
              <td>{transaction.price}</td>
              <td>{transaction.dateOfSale}</td>
              <td>{transaction.sold ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table> */}
      <div className='d-flex justify-content-evenly'>
        <button className="btn btn-primary" onClick={() => handlePageChange(-1)} disabled={page === 1}>
          Previous
        </button>
        <button className="btn btn-primary" onClick={() => handlePageChange(1)}>Next</button>
      </div>
    </div>
  );
};

export default Table;
