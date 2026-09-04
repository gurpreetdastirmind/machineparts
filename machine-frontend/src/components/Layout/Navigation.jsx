import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiChevronDown, FiChevronRight } from 'react-icons/fi'

const Navigation = () => {
  const [activeMenu, setActiveMenu] = useState(null)

  const menuItems = [
    { name: 'Home', path: '/' },
    {
      name: 'Sewing Parts',
      path: '/products?category=sewing-parts',
      subcategories: [
        { name: 'JUKI', slug: 'juki' },
        { name: 'JACK', slug: 'jack' },
        { name: 'PEGASUS', slug: 'pegasus' },
        { name: 'SIRUBA', slug: 'siruba' },
        { name: 'YAMATO', slug: 'yamato' },
        { name: 'BROTHER', slug: 'brother' },
        { name: 'KANSAI SPECIAL', slug: 'kansai-special' },
      ]
    },
  ]

  const brandCategories = [
    {
      id: 1, name: 'JUKI', slug: 'juki', count: 45,
      subcategories: ['Single Needle Lockstitch', 'Overlock', 'Flatlock / Interlock', 'Button Hole Machine', 'Button Stitch Machine', 'Bar Tacking / Button Attaching', '2 or 3 Needle Chainstitch', 'Feed-Off-The-Arm', 'Double Needle Lockstitch', 'Flat-Bed Multi Needle']
    },
    {
      id: 2, name: 'JACK', slug: 'jack', count: 30,
      subcategories: ['JK-9100 / JK-9100B', 'JK-781 / JK-T781D', 'JK-T1790', 'JK-T1377 / 372 / 373', 'JK-768 / 798 / 795', 'JK-T9270 / T9280', 'JK-8558 / JK-8560', 'BE-438D']
    },
    {
      id: 3, name: 'PEGASUS', slug: 'pegasus', count: 35,
      subcategories: ['F4 / F5', 'M700 Series - M752/M732', 'M800 Series - M852/M832', 'M900 Series - M952/M932', 'M600 Series - M652/M632', 'R53 / R57', 'W500 / W562', 'W1500N', 'W600 / W664', '700F - 747/757/767', '700K Series - 747K/757K/767K', 'F007', 'VC008', 'CZ-6000 Series - CZ-6125', 'AZ8000 Series', 'CF2300M']
    },
    {
      id: 4, name: 'SIRUBA', slug: 'siruba', count: 25,
      subcategories: ['A2 / A2S', 'A3 / A4 / A5', 'HE-800A', 'Button Stitch / Bartack Machine', 'Overlock', 'Flatlock / Interlock']
    },
    {
      id: 5, name: 'YAMATO', slug: 'yamato', count: 20,
      subcategories: ['Flat-Bed Multi Needle', 'Cylinder-Bed Multi Needle', 'Belt Attaching - DLR Series', 'LH4-B814', 'DFB Series - 1404 / 1406 / 1408 / 1412', 'FX Series - 4404 / 4412', 'DLR Series - 1508P / 1509P']
    },
    {
      id: 6, name: 'BROTHER', slug: 'brother', count: 28,
      subcategories: ['Single Needle Lockstitch', 'Overlock', 'Flatlock / Interlock', 'Button Hole', 'Multi-Needle']
    },
    {
      id: 7, name: 'KANSAI SPECIAL', slug: 'kansai-special', count: 18,
      subcategories: ['E4 / E4-5', 'Flatlock / Interlock', 'Multi Needle', 'W4', 'Overlock']
    },
  ]

  return (
    <nav className="relative bg-gray-100 border-b border-gray-200 hidden lg:block w-full">
      <div className="container-custom">
        <ul className="flex items-center">
          {menuItems.map((item, index) => (
            <li
              key={index}
              className={index === 1 ? "" : "relative"}
              onMouseEnter={() => setActiveMenu(index)}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <Link
                to={item.path}
                className="block px-4 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                {item.name}
                {index > 0 && (
                  <FiChevronDown className="inline ml-1 text-xs" />
                )}
              </Link>

              {index > 0 && activeMenu === index && (
                <>
                  {/* Sewing Parts: Full-Width Mega Menu */}
                  {index === 1 ? (
                    <div className="absolute left-0 top-full w-full bg-white shadow-xl border-t border-gray-200 py-6 z-50">
                      <div className="container-custom">
                        <div className="grid grid-cols-4 gap-6">
                          {brandCategories.map((category) => (
                            <div key={category.id} className="space-y-2">
                              <h4 className="font-semibold text-gray-800 text-sm uppercase hover:text-blue-600">
                                <Link to={`/products?category=${category.slug}`}>
                                  {category.name} ({category.count})
                                </Link>
                              </h4>
                              <ul className="space-y-1">
                                {category.subcategories.slice(0, 6).map((sub, idx) => (
                                  <li key={idx}>
                                    <Link
                                      to={`/products?category=${category.slug}&sub=${sub.toLowerCase().replace(/ /g, '-')}`}
                                      className="text-sm text-gray-600 hover:text-blue-600 block py-0.5"
                                    >
                                      {sub}
                                    </Link>
                                  </li>
                                ))}
                                {category.subcategories.length > 6 && (
                                  <li>
                                    <Link
                                      to={`/products?category=${category.slug}`}
                                      className="text-sm text-blue-600 hover:underline font-medium"
                                    >
                                      View All <FiChevronRight className="inline" />
                                    </Link>
                                  </li>
                                )}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Standard Dropdown: Vertical List directly under item */
                    <div className="absolute left-0 top-full w-64 bg-white shadow-lg border border-gray-200 rounded-b-md py-2 z-50">
                      <ul className="flex flex-col">
                        {item.subcategories && item.subcategories.map((sub, idx) => (
                          <li key={idx} className="relative group/sub">
                            <Link
                              to={`/products?category=${sub.slug}`}
                              className="flex items-center justify-between px-4 py-2 text-xs text-gray-700 hover:bg-lime-400 hover:text-black transition-colors font-medium"
                            >
                              <span>{sub.name}</span>
                              {sub.items && <FiChevronRight className="text-xs ml-2 flex-shrink-0" />}
                            </Link>

                            {/* Level 2 Submenu (Flyout) */}
                            {sub.items && (
                              <div className="hidden group-hover/sub:block absolute left-full top-0 w-48 bg-white shadow-lg border border-gray-200 py-2 z-50">
                                {sub.items.map((nestedItem, nIdx) => (
                                  <Link
                                    key={nIdx}
                                    to={`/products?category=${nestedItem.slug}`}
                                    className="block px-4 py-2 text-xs text-gray-700 hover:bg-lime-400 hover:text-black transition-colors"
                                  >
                                    {nestedItem.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

export default Navigation