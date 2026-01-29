import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "./context/authContext";
import { useTheme } from "@/components/context/theme-provider";
import { Button } from "./ui/button";
import { ModeToggle } from "./mode-toggle";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const Navbar_1 = () => {
  const { theme } = useTheme();
  const { isLoggedIn, username, logout } = useContext(AuthContext);

  return (
    <div
      className="navbar flex flex-col items-center p-2 sm:p-3 w-full gradient-bg text-white shadow-lg"
    >
      <div className="w-full max-w-7xl m-auto flex flex-col items-center sm:flex-row sm:justify-between">
        <div className="logo w-full flex justify-between sm:justify-center items-center sm:w-auto mb-4 sm:mb-0 px-[1vw]">
          {/* linking to home page... */}
          <Link to="/" className="text-bold cursor-pointer">
            <h1>CodeYourWay</h1>
          </Link>
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="sm:hidden">
                <HamburgerMenuIcon />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <div className="flex justify-between w-full sm:w-auto">
                  <ModeToggle />
                  <div>
                    {/* when logged in, user will see his name, else login and register */}
                    {/* buttons */}
                    {isLoggedIn ? (
                      <div className="flex justify-between">
                        <Button variant="outline">{username}</Button>
                        <Button
                          variant="ghost"
                          onClick={logout}
                          className="ml-2"
                        >
                          Logout
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-between">
                        <Link to={"/signup"}>
                          <Button variant="ghost">Register</Button>
                        </Link>
                        <Link to={"/login"}>
                          <Button variant="ghost" className="ml-2">
                            Login
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </DrawerHeader>
              <DrawerFooter>
                <div className="nav-links font-semibold">
                  <ul>
                    <Link to="/problems" className="cursor-pointer hover:text-primary">
                      <li>Problems</li>
                    </Link>
                    <li>Discuss</li>
                    {/* linking to playground page */}
                    <Link to="/playground" className="text-bold cursor-pointer">
                      <li>Playground</li>
                    </Link>
                  </ul>
                </div>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
        <div className="hidden sm:flex sm:flex-row sm:items-center">
          <div className="nav-links">
            <ul className="flex justify-evenly w-[40vw]">
              <Link to="/problems" className="cursor-pointer font-medium hover:text-primary transition-colors">
                <li>Problems</li>
              </Link>
              <li>Discuss</li>
              {/* linking to playground page */}
              <Link to="/playground" className="text-bold cursor-pointer hover:text-primary transition-colors">
                <li>Playground</li>
              </Link>
            </ul>
          </div>
          <div className="flex justify-between w-full sm:w-auto">
            <ModeToggle />
            <div className="ml-4">
              {isLoggedIn ? (
                <div className="flex justify-between">
                  <Link to="/profile">
                    <Button variant="outline" className="bg-white/20 text-white border-white/40 hover:bg-white/30 hover:text-white">
                      {username}
                    </Button>
                  </Link>
                  <Button variant="ghost" onClick={logout} className="ml-2 text-white hover:bg-white/20 hover:text-white">
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex justify-between">
                  <Link to={"/signup"}>
                    <Button variant="ghost" className="text-white hover:bg-white/20 hover:text-white">Register</Button>
                  </Link>
                  <Link to={"/login"}>
                    <Button variant="ghost" className="ml-2 text-white hover:bg-white/20 hover:text-white">
                      Login
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar_1;
