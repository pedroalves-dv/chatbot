"use client";

import { useState } from "react";
import SearchBar from "./SearchBar";
import Featured from "./Featured";
import TimezoneList from "./TimezoneList";

export default function AppLayout() {
  const [timezones, setTimezones] = useState([]);

  const onSearch = (timezone) => {
    setTimezones([...timezones, timezone]);
  };


const onRemove = (timezone) => {
  setTimezones(timezones.filter(tz => tz !== timezone));
};

  const onFavorite = (timezone) => {
    console.log("Favorited:", timezone);
  };

  return (
    <div>
      <SearchBar onSearch={onSearch} />
      <Featured />
      <TimezoneList timezone={timezones} onRemove={onRemove} onFavorite={onFavorite} />
    </div>
  );
}
