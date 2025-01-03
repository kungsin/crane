import Style from './Menu.module.less';
import FullLogo from 'assets/svg/crane-logo-full.svg?component';
import MiniLogo from 'assets/svg/crane-logo-mini.svg?component';
import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from 'assets/logo.jpg';
interface IProps {
  collapsed?: boolean;
}

export default memo((props: IProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/');
  };

  return (
    // <div className={Style.menuLogo} onClick={handleClick}>
    //   {props.collapsed ? <MiniLogo /> : <FullLogo />}
    // </div>
    <div className={Style.menuLogo}>
      <img src={Logo} alt='logo' width={'100px'}/>
    </div>
  );
});
