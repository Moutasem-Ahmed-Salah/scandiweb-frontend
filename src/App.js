import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  

  

  return (
    <div>
<ul className="flex list-none p-0 ml-16 mt-6">
  <li className="mr-6">
    <a href="/" className="relative text-gray-800 hover:text-green-600 after:absolute after:w-0 after:h-[2px] after:bg-green-600 after:left-0 after:-bottom-0.5 hover:after:w-full after:transition-width after:duration-300">
      All
    </a>
  </li>
  <li className="mr-6">
    <a href="/tech" className="relative text-gray-800 hover:text-green-600 after:absolute after:w-0 after:h-[2px] after:bg-green-600 after:left-0 after:-bottom-0.5 hover:after:w-full after:transition-width after:duration-300">
      Tech
    </a>
  </li>
  <li className="mr-6">
    <a href="/sports" className="relative text-gray-800 hover:text-green-600 after:absolute after:w-0 after:h-[2px] after:bg-green-600 after:left-0 after:-bottom-0.5 hover:after:w-full after:transition-width after:duration-300">
      Clothes
    </a>
  </li>
</ul>


      <BrowserRouter>
        <Routes>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
