import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import * as React from 'react'

export type IMenu = {
  id: number;
  title: string;
  url: string;
  dropdown?: boolean;
  items?: IMenu[];
};

type MenuProps = {
  list: IMenu[];
};

const Menu = ({ list }: MenuProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <MotionConfig transition={{ bounce: 0, type: 'tween' }}>
      <nav className={'relative'}>
        <ul className={'flex items-center'}>
          {list?.map((item) => {
            return (
              <li key={item.id} className={'relative'}>
                <Link
                  className={`
                    relative flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-all
                    hover:bg-white/10
                    ${hovered === item?.id ? 'bg-white/10 text-amber-200' : 'text-white/70'}
                  `}
                  onMouseEnter={() => setHovered(item.id)}
                  onMouseLeave={() => setHovered(null)}
                  to={item?.url}
                >
                  {item?.title}
                </Link>
                {hovered === item?.id && !item?.dropdown && (
                  <motion.div
                    layout
                    layoutId={`cursor`}
                    className={'absolute -bottom-1 left-0 h-[2px] w-full bg-amber-400'}
                  />
                )}
                {item?.dropdown && hovered === item?.id && (
                  <div
                    className='absolute left-0 top-full pt-2 z-50'
                    onMouseEnter={() => setHovered(item.id)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <motion.div
                      layout
                      transition={{ bounce: 0 }}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 10, opacity: 0 }}
                      style={{
                        borderRadius: '12px',
                      }}
                      className='flex w-64 flex-col rounded-xl bg-[#0F131E] border border-white/10 p-2 shadow-2xl backdrop-blur-xl'
                      layoutId={'cursor'}
                    >
                      {item?.items?.map((nav) => {
                        return (
                          <Link
                            key={`link-${nav?.id}`}
                            to={`${nav?.url}`}
                            className={'w-full px-4 py-3 rounded-lg text-sm text-white/70 hover:text-amber-200 hover:bg-white/5 transition-all'}
                          >
                            {nav?.title}
                          </Link>
                        );
                      })}
                    </motion.div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </MotionConfig>
  );
};

export default Menu;
