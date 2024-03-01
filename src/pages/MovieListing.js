import React from 'react'
import NavigationBar from '../components/NavigationBar';
import Footer from '../components/Footer';
import Header from '../components/Header';

const MovieListing = () => {
  return (
    <div>
        <NavigationBar/>
        <Header title={'Listing'}/>
        <Footer/>  
    </div>
  )
}

export default MovieListing
