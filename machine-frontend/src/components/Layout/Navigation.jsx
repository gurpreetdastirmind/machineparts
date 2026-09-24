import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiChevronDown, FiChevronRight } from 'react-icons/fi'

const Navigation = () => {
  const [activeMenu, setActiveMenu] = useState(null)

  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/products' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact Us', path: '/contact' },
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
      subcategories: [ {
          name: 'Single Needle Lockstitch',
          items: ['DDL-8100 / 8300 / 8500BP / 8700','DDL-8700-7/8100-7/700A/9000/900UBT','DDL-5500/DDL-555']
        },  {
          name: 'Overlock',
          items: ['MO-2500','MO-3300','MO-6700','MO-6800']
        },  {
        name: 'Flatlock / Interlock',
        items: ['MF-7500','MF-7700']
      }, 'Button Hole Machine',{
          name: 'Button Hole Machine',
           items: ['LBH-781/771/761', 'LBH-1790']
        },{ name: 'Button Stitch Machine', items: ['MB-372 / 373 / 377','MB-1373 / 1377'] }, { name: 'Bar Tracking / Button Attacking', items: ['LK-1900A/LK-1900B','LK-1850'] }, { name: '2 or 3 Needle Chain Stitch Machine', items: ['MH-380'] }]
    },
    {
      id: 2, name: 'JACK', slug: 'jack', count: 30,
      subcategories: [
        {
          name: 'Single Needle Lockstitch',
          items: ['JK-9100 / JK-9100B / JK-9100BP / JK-9100BS', 'F4/F5', 'A2/A2S/A3/A4/A5']
        }
        ,
        {
          name: 'Overlock',
          items: ['JK-768/798/795', 'E4 / E4-5']
        }
        , 
        {
        name: 'Flatlock / Interlock',
        items: ['W4','JK-8568/JK-8569']
      },{
          name: 'Button Hole Machine',
           items: ['JK-781/JK-T781D', 'JK-T1790']
        }, { name: 'Button Stitch Machine', items: ['JK-T1377 / 372 / 373'] }, { name: 'Feed-Off-The-Arm', items: ['JK-T9270 / T9280'] }, { name: '2 or 3 Needle Chain Stitch Machine', items: ['JK-8558 / JK-8560 / JK-8560PL'] },
      ]
    },
    {
      id: 3, name: 'PEGASUS', slug: 'pegasus', count: 35,
      subcategories: [{
        name: 'Overlock',
        items: ['M700 Series - M752/M732', 'M800 Series - M852/M832', 'M900 Series - M952/932', 'M600 Series - M652/M632', 'R53 / R57']
      },
      {
        name: 'Flatlock / Interlock',
        items: ['W500 /W562', 'W1500N', 'W600/W664']
      }]
    },
    {
      id: 4, name: 'SIRUBA', slug: 'siruba', count: 25,
      subcategories: [{
        name: 'Overlock',
        items: ['700F - 747/757/767', '700K Series - 747K/757K/767K']
      },
      {
        name: 'Flatlock / Interlock',
        items: ['F007']
      },
      {
        name: 'Multi-Needle Elastic and Tape Attaching',
        items: ['VC008']
      }]
    },
    {
      id: 5, name: 'YAMATO', slug: 'yamato', count: 20,
      subcategories: [
        {
          name: 'Overlock',
          items: ['CZ-6000 Series - CZ-6125', 'AZ8000 Series']
        },
        {
          name: 'Flatlock / Interlock',
          items: ['CF2300M']
        }
      ]
    },
    {
      id: 6, name: 'BROTHER', slug: 'brother', count: 28,
      subcategories: [
        {
          name: 'Feed-off-the-Arm',
          items: ['DA-9270 / 9280']
        },
        {
          name: 'Single Needle Lockstitch',
          items: ['S7200A / S7200B / S7200C']
        },
        {
          name: 'Double Needle Lockstitch',
          items: ['LT2-B842 / T8420']
        },
        {
          name: 'Button Stitch / Bartack Machine',
          items: ['BE-438D']
        },
        {
          name: 'Button Hole Machine',
          items: ['HE-800A', 'LH4-B814']
        },
      ]
    },
    {
      id: 7, name: 'KANSAI SPECIAL', slug: 'kansai-special', count: 18,
      // ✅ UPDATED: Three main subcategories with nested items
      subcategories: [
        {
          name: 'Flat-Bed Multi Needle',
          items: ['DFB Series - 1404 / 1406 / 1408 / 1412']
        },
        {
          name: 'Cylinder-Bed Multi Needle',
          items: ['FX Series - 4404 / 4412']
        },
        {
          name: 'Belt Attaching',
          items: ['DLR Series - 1508P / 1509P']
        }
      ]
    },
  ]

  return (
    <nav className="relative bg-gray-100 border-b border-gray-200 hidden lg:block w-full">
      <div className="container-custom">
        <ul className="flex items-center">
          {menuItems.map((item, index) => (
            <li
              key={index}
              className={item.subcategories ? "" : "relative"}
              onMouseEnter={() => setActiveMenu(index)}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <Link
                to={item.path}
                className="block px-4 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                {item.name}
                {item.subcategories && (
                  <FiChevronDown className="inline ml-1 text-xs" />
                )}
              </Link>

              {item.subcategories && activeMenu === index && (
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

                          {/* ✅ UPDATED RENDERING LOGIC TO HANDLE NESTED ITEMS */}
                          <ul className="space-y-3">
                            {category.subcategories.slice(0, 6).map((sub, idx) => {
                              // Check if it's an object (like Kansai Special) or a simple string
                              const isObject = typeof sub === 'object' && sub !== null;
                              const subName = isObject ? sub.name : sub;
                              const subLink = `/products?category=${category.slug}&sub=${subName.toLowerCase().replace(/ /g, '-')}`;

                              return (
                                <li key={idx}>
                                  {/* Main Subcategory (Dark Black if it's an object) */}
                                  <Link
                                    to={subLink}
                                    className={`block py-0.5 ${isObject
                                        ? 'font-bold text-gray-900' // Dark black and bold for Kansai Special
                                        : 'text-sm text-gray-600 hover:text-blue-600'
                                      }`}
                                  >
                                    {subName}
                                  </Link>

                                  {/* Nested Items (Only for objects like Kansai Special) */}
                                  {isObject && sub.items && (
                                    <ul className="pl-3 mt-1 space-y-1 border-l border-gray-200">
                                      {sub.items.map((item, i) => (
                                        <li key={i}>
                                          <Link
                                            to={`/products?category=${category.slug}&sub=${item.toLowerCase().replace(/ /g, '-')}`}
                                            className="text-xs text-gray-500 hover:text-blue-600 block py-0.5"
                                          >
                                            {item}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </li>
                              );
                            })}

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
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

export default Navigation