import { useStorePage } from "~/hooks";
import Left from "./Header/Left";
import Center from "./Header/Center";
import Right from "./Header/Right";

const Header = () => {
  const { store: storePage } = useStorePage();
  return (
    <div className="flex items-center mx-6">
      <div className="flex-1">
        <Left title={storePage.title} />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <Center />
      </div>
      <div className="flex-1 flex justify-end">
        <Right />
      </div>
    </div>
  );
};

export default Header;
