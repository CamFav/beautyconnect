export default function LocationFilter({
  locationFilter,
  setLocationFilter,
  typedCity,
  setTypedCity,
  setSelectedCity,
  citySuggestions = [],
  setCitySuggestions,
  setShouldFilter,
  fetchCitySuggestions,
}) {
  const sanitize = (val) =>
    typeof val === "string" ? val.trim().replace(/[<>]/g, "") : val;

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex items-center gap-3">
        <label
          htmlFor="locationFilter"
          className="text-sm text-gray-700 font-medium"
        >
          Localisation :
        </label>
        <select
          id="locationFilter"
          value={locationFilter}
          onChange={(e) => {
            setLocationFilter(e.target.value);
            if (e.target.value === "all") setShouldFilter(false);
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">Toute la France</option>
          <option value="city">Choisir une ville</option>
        </select>
      </div>

      {locationFilter === "city" && (
        <div className="relative flex flex-col gap-2 mt-3">
          <input
            type="text"
            placeholder="Recherchez une ville"
            value={typedCity}
            onChange={(e) => {
              const val = sanitize(e.target.value);
              setTypedCity(val);
              fetchCitySuggestions(val);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />

          {Array.isArray(citySuggestions) && citySuggestions.length > 0 && (
            <ul className="absolute z-10 bg-white border border-gray-200 rounded mt-1 max-h-40 overflow-y-auto shadow">
              {citySuggestions.map((city, idx) => (
                <li
                  key={idx}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    const sanitizedCity = sanitize(city);
                    setTypedCity(sanitizedCity);
                    setSelectedCity(sanitizedCity);
                    setCitySuggestions([]);
                    setShouldFilter(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      const sanitizedCity = sanitize(city);
                      setTypedCity(sanitizedCity);
                      setSelectedCity(sanitizedCity);
                      setCitySuggestions([]);
                      setShouldFilter(true);
                    }
                  }}
                  className="cursor-pointer px-3 py-1 hover:bg-gray-100 text-sm"
                >
                  {city}
                </li>
              ))}
            </ul>
          )}

          <button
            onClick={() => {
              const sanitizedCity = sanitize(typedCity);
              if (sanitizedCity !== "") {
                setSelectedCity(sanitizedCity);
                setShouldFilter(true);
              }
            }}
            className="bg-blue-600 text-white text-sm px-3 py-2 rounded-lg"
          >
            Valider
          </button>
        </div>
      )}
    </div>
  );
}
