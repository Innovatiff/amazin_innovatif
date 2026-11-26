// Old address of the booking form: carry on to the new one, keeping the query
// string so a returning payment ("?payment=success") is still recognised.
location.replace('/get-started' + location.search);
