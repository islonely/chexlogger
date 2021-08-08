import Receipt, { Item } from './comps/Receipt';
import ReceiptContainer from './comps/ReceiptContainer';

import './App.css';

function App() {
	ReceiptContainer();

	let content = [Receipt({
		description: 'Uber Eats Order',
		taxes: 2.35,
		discount: 20.00,
		items: [
			new Item('Pizza', 25.83),
			new Item('Tip', 3.80),
			new Item('Service Fee', 3.87)
		]
	})];

	return content;
}

export default App;
