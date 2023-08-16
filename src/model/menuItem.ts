interface MenuItem {
    key: string;
    icon?: React.ReactNode;
    label: React.ReactNode;
    path: string;
    children?: MenuItem[];
  }
  
  export default MenuItem;
  