import { Paper } from "@mui/material";
import SearchAppBar from "./Components/AppBar";
import EventSearch from "./Components/EventSearch";

export default function App() {
  return (
    <div className="flex flex-col">
      <SearchAppBar />

      <div className="flex p-8 justify-center flex-1">
        <EventSearch />
      </div>
    </div>
  );
}
