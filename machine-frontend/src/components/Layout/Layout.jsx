import React from 'react'
import Header from './Header'
import Navigation from './Navigation'
import Footer from './Footer'
import MobileMenu from './MobileMenu'
import Newsletter from '../Common/Newsletter'
import Breadcrumb from '../Common/Breadcrumb'

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <Header />
      <Navigation />
      <main className="flex-grow w-full">
        <div className="container-custom py-4">
          <Breadcrumb />
          {children}
        </div>
      </main>
      <Footer />
      <MobileMenu />
    </div>
  )
}

export default Layout