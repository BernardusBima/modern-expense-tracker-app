// 1. --- SELEKSI ELEMENT DOM ---
const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const myChartCanvas = document.getElementById('myChart').getContext('2d');
const typeIncomeRadio = document.getElementById('type-income'); // Radio button Pemasukan

// Elemen untuk Modal Edit & Filter (tetap sama)
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const editId = document.getElementById('edit-id');
const editText = document.getElementById('edit-text');
const editAmount = document.getElementById('edit-amount');
const cancelBtn = document.getElementById('cancel-btn');
const filterBtns = document.querySelectorAll('.filter-btn');

// 2. --- STATE & INISIALISASI ---
const localStorageTransactions = JSON.parse(localStorage.getItem('transactions'));
let transactions = localStorage.getItem('transactions') !== null ? localStorageTransactions : [];
let myChart;
let currentFilter = 'all';

// 3. --- FUNGSI-FUNGSI UTAMA ---

// >>> FUNGSI INI BERUBAH <<<
function addTransaction(e) {
    e.preventDefault();

    const transactionText = text.value.trim();
    const transactionAmount = +amount.value;
    const isExpense = !typeIncomeRadio.checked; // Cek apakah radio button "Pengeluaran" yang dipilih

    if (transactionText === '' || transactionAmount <= 0) {
        alert('Mohon isi deskripsi dan jumlah transaksi dengan benar (jumlah harus lebih dari 0)');
    } else {
        const finalAmount = isExpense ? -transactionAmount : transactionAmount;

        const transaction = {
            id: generateID(),
            text: transactionText,
            amount: finalAmount
        };
        transactions.push(transaction);
        updateLocalStorage();
        init();
        text.value = '';
        amount.value = '';
        typeIncomeRadio.checked = true; // Reset ke Pemasukan
    }
}

function generateID() {
    return Math.floor(Math.random() * 100000000);
}

// >>> FUNGSI INI DITAMBAH IKON <<<
function addTransactionDOM(transaction) {
    const sign = transaction.amount < 0 ? '-' : '+';
    const item = document.createElement('li');
    item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');

    const iconClass = transaction.amount < 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
    const iconColor = transaction.amount < 0 ? 'style="color: var(--color-minus);"' : 'style="color: var(--color-plus);"';

    item.innerHTML = `
        <i class="list-icon ${iconClass}" ${iconColor}></i>
        <div class="transaction-text">${transaction.text}</div>
        <div class="transaction-amount">${sign}Rp ${formatMoney(Math.abs(transaction.amount))}</div>
        <div class="action-buttons">
            <button class="edit-btn" onclick="showEditModal(${transaction.id})"><i class="fas fa-edit"></i></button>
            <button class="delete-btn" onclick="removeTransaction(${transaction.id})"><i class="fas fa-trash"></i></button>
        </div>
    `;
    list.prepend(item); // Gunakan prepend agar transaksi baru ada di atas
}


function updateValues() {
    const amounts = transactions.map(t => t.amount);
    const total = amounts.reduce((acc, item) => (acc += item), 0);
    const income = amounts.filter(item => item > 0).reduce((acc, item) => (acc += item), 0);
    const expense = (amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) * -1);
    balance.innerText = `Rp ${formatMoney(total.toFixed(2))}`;
    money_plus.innerText = `+Rp ${formatMoney(income.toFixed(2))}`;
    money_minus.innerText = `-Rp ${formatMoney(expense.toFixed(2))}`;
    updateChart(income, expense);
}

function removeTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    updateLocalStorage();
    init();
}

function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function formatMoney(number) {
    return Number(number).toLocaleString('id-ID');
}

// --- FUNGSI UNTUK FITUR EDIT ---
function showEditModal(id) {
    const transaction = transactions.find(trx => trx.id === id);
    if (!transaction) return;
    editId.value = transaction.id;
    editText.value = transaction.text;
    editAmount.value = transaction.amount;
    editModal.classList.add('show');
}

function hideEditModal() {
    editModal.classList.remove('show');
}

// >>> FUNGSI INI TETAP SAMA, MODAL MASIH PAKAI INPUT +/- <<<
function updateTransaction(e) {
    e.preventDefault();
    const id = +editId.value;
    const newText = editText.value;
    const newAmount = +editAmount.value;

    if (newText.trim() === '' || isNaN(newAmount) || newAmount === 0) {
        alert('Mohon isi data dengan benar');
        return;
    }

    transactions = transactions.map(trx =>
        trx.id === id ? { id: trx.id, text: newText, amount: newAmount } : trx
    );
    updateLocalStorage();
    hideEditModal();
    init();
}

// --- FUNGSI UNTUK CHART ---
function updateChart(income, expense) {
    if (myChart) { myChart.destroy(); }
    myChart = new Chart(myChartCanvas, {
        type: 'doughnut',
        data: {
            labels: ['Pemasukan', 'Pengeluaran'],
            datasets: [{
                data: [income, expense],
                backgroundColor: [ 'rgba(46, 204, 113, 0.8)', 'rgba(231, 76, 60, 0.8)' ],
                borderColor: [ '#fff', '#fff' ],
                borderWidth: 2,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            cutout: '70%'
        }
    });
}

// --- FUNGSI INISIALISASI APLIKASI ---
function init() {
    list.innerHTML = '';
    transactions.filter(trx => {
        if (currentFilter === 'income') return trx.amount > 0;
        if (currentFilter === 'expense') return trx.amount < 0;
        return true;
    }).forEach(addTransactionDOM);
    updateValues();
}

// 4. --- EVENT LISTENERS ---
form.addEventListener('submit', addTransaction);
editForm.addEventListener('submit', updateTransaction);
cancelBtn.addEventListener('click', hideEditModal);

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        init();
    });
});

init();