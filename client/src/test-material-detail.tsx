
import React from 'react';
import { useParams } from 'react-router-dom';

const TestMaterialDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div className="p-8">
      <h1>Test Material Detail Page</h1>
      <p>Material ID: {id}</p>
      <p>If you can see this, the routing is working.</p>
    </div>
  );
};

export default TestMaterialDetail;
