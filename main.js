document.addEventListener('DOMContentLoaded', function() {
  // Initialize variables
  let itemCounter = 1;
  const today = new Date();
  
  // Set default date
  document.getElementById('receiptDate').valueAsDate = today;
  
  // Set default tax rate
  document.getElementById('taxRate').value = "10";
  
  // Generate a random receipt number
  document.getElementById('receiptNumber').value = generateReceiptNumber();
  
  // Add event listeners
  document.getElementById('addItemBtn').addEventListener('click', addNewItem);
  document.getElementById('generateReceiptBtn').addEventListener('click', generateReceipt);
  document.getElementById('printReceiptBtn').addEventListener('click', printReceipt);
  document.getElementById('downloadPdfBtn').addEventListener('click', downloadPdf);
  
  // Setup item input calculations
  setupItemCalculations();
  
  // Setup downpayment calculations
  document.getElementById('downpaymentAmount').addEventListener('input', function() {
    const downpaymentAmount = parseFloat(this.value) || 0;
    if (downpaymentAmount < 0) {
      this.value = 0;
    }
  });
  
  // Function to generate random receipt number
  function generateReceiptNumber() {
    const prefix = "REC";
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  }
  
  // Function to setup item calculations
  function setupItemCalculations() {
    const quantityInputs = document.querySelectorAll('.item-quantity');
    const priceInputs = document.querySelectorAll('.item-price');
    
    quantityInputs.forEach(input => {
      input.addEventListener('input', updateItemTotal);
    });
    
    priceInputs.forEach(input => {
      input.addEventListener('input', updateItemTotal);
    });
  }
  
  // Function to update item total
  function updateItemTotal(event) {
    const row = event.target.closest('.item-row');
    const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
    const price = parseFloat(row.querySelector('.item-price').value) || 0;
    const total = quantity * price;
    
    row.querySelector('.item-total-value').textContent = `₱${total.toFixed(2)}`;
  }
  
  // Function to add a new item row
  function addNewItem() {
    itemCounter++;
    
    const itemsContainer = document.getElementById('itemsContainer');
    const newItemRow = document.createElement('div');
    newItemRow.className = 'item-row';
    
    newItemRow.innerHTML = `
      <div class="form-group">
        <label for="item${itemCounter}">Item:</label>
        <input type="text" id="item${itemCounter}" class="item-name">
      </div>
      
      <div class="form-group">
        <label for="quantity${itemCounter}">Quantity:</label>
        <input type="number" id="quantity${itemCounter}" class="item-quantity" min="1" value="1">
      </div>
      
      <div class="form-group">
        <label for="price${itemCounter}">Unit Price:</label>
        <input type="number" id="price${itemCounter}" class="item-price" min="0" step="0.01">
      </div>
      
      <div class="form-group item-total">
        <label>Total:</label>
        <span class="item-total-value">₱0.00</span>
      </div>
      
      <button type="button" class="remove-item-btn">Remove</button>
    `;
    
    itemsContainer.appendChild(newItemRow);
    
    // Add event listeners for the new row
    const quantityInput = newItemRow.querySelector('.item-quantity');
    const priceInput = newItemRow.querySelector('.item-price');
    const removeButton = newItemRow.querySelector('.remove-item-btn');
    
    quantityInput.addEventListener('input', updateItemTotal);
    priceInput.addEventListener('input', updateItemTotal);
    removeButton.addEventListener('click', function() {
      itemsContainer.removeChild(newItemRow);
    });
    
    // Enable all remove buttons if there's more than one item
    if (itemsContainer.children.length > 1) {
      document.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.disabled = false;
      });
    }
  }
  
  // Function to generate receipt
  function generateReceipt() {
    // Get values from form
    const businessName = document.getElementById('businessName').value;
    const businessLogo = document.getElementById('businessLogo').value;
    const receiptNumber = document.getElementById('receiptNumber').value;
    const receiptDate = document.getElementById('receiptDate').value;
    const customerName = document.getElementById('customerName').value;
    const customerEmail = document.getElementById('customerEmail').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
    const discountType = document.getElementById('discountType').value;
    const discountValue = parseFloat(document.getElementById('discountValue').value) || 0;
    const downpaymentAmount = parseFloat(document.getElementById('downpaymentAmount').value) || 0;
    
    // Set business info in preview
    document.getElementById('previewBusinessName').textContent = businessName;
    document.getElementById('previewReceiptNumber').textContent = receiptNumber;
    document.getElementById('previewDate').textContent = formatDate(receiptDate);
    
    // Set logo if provided
    const previewLogo = document.getElementById('previewLogo');
    previewLogo.innerHTML = '';
    if (businessLogo) {
      const img = document.createElement('img');
      img.src = businessLogo;
      img.alt = businessName + ' Logo';
      previewLogo.appendChild(img);
    }
    
    // Set customer info in preview
    document.getElementById('previewCustomerName').textContent = customerName;
    document.getElementById('previewCustomerEmail').textContent = customerEmail;
    document.getElementById('previewCustomerPhone').textContent = customerPhone;
    
    // Process items
    const itemRows = document.querySelectorAll('.item-row');
    const previewItems = document.getElementById('previewItems');
    previewItems.innerHTML = '';
    
    let subtotal = 0;
    
    itemRows.forEach(row => {
      const itemName = row.querySelector('.item-name').value;
      const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
      const unitPrice = parseFloat(row.querySelector('.item-price').value) || 0;
      const itemTotal = quantity * unitPrice;
      
      if (itemName && quantity && unitPrice) {
        subtotal += itemTotal;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${itemName}</td>
          <td>${quantity}</td>
          <td>₱${unitPrice.toFixed(2)}</td>
          <td>₱${itemTotal.toFixed(2)}</td>
        `;
        
        previewItems.appendChild(tr);
      }
    });
    
    // Calculate totals
    const taxAmount = subtotal * (taxRate / 100);
    
    // Apply discount
    let discountAmount = 0;
    if (discountValue > 0) {
      if (discountType === 'percentage') {
        discountAmount = subtotal * (discountValue / 100);
      } else {
        discountAmount = discountValue;
      }
    }
    
    const total = subtotal - discountAmount + taxAmount;
    const balance = total - downpaymentAmount;
    
    // Update preview totals
    document.getElementById('previewSubtotal').textContent = subtotal.toFixed(2);
    document.getElementById('previewTaxRate').textContent = taxRate;
    document.getElementById('previewTaxAmount').textContent = taxAmount.toFixed(2);
    
    // Show discount in preview if applied
    if (discountAmount > 0) {
      document.getElementById('discountRow').style.display = 'block';
      document.getElementById('previewDiscountType').textContent = 
        discountType === 'percentage' ? `${discountValue}%` : 'Fixed';
      document.getElementById('previewDiscountAmount').textContent = discountAmount.toFixed(2);
    } else {
      document.getElementById('discountRow').style.display = 'none';
    }
    
    document.getElementById('previewTotal').textContent = total.toFixed(2);
    
    // Show downpayment if applied
    if (downpaymentAmount > 0) {
      document.getElementById('downpaymentRow').style.display = 'block';
      document.getElementById('previewDownpayment').textContent = downpaymentAmount.toFixed(2);
      document.getElementById('balanceRow').style.display = 'block';
      document.getElementById('previewBalance').textContent = balance.toFixed(2);
    } else {
      document.getElementById('downpaymentRow').style.display = 'none';
      document.getElementById('balanceRow').style.display = 'none';
    }
    
    document.getElementById('previewPaymentMethod').textContent = paymentMethod;
    
    // Show receipt
    document.getElementById('receiptPreview').style.display = 'block';
    
    // Scroll to receipt
    document.getElementById('receiptPreview').scrollIntoView({ behavior: 'smooth' });
  }
  
  // Function to format date
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  // Function to print receipt
  function printReceipt() {
    window.print();
  }
  
  // Function to download as PDF
  function downloadPdf() {
    const element = document.getElementById('receiptContent');
    const businessName = document.getElementById('businessName').value || 'Business';
    const receiptNumber = document.getElementById('receiptNumber').value || 'Receipt';
    
    // Create a filename
    const filename = `${businessName}-${receiptNumber}.pdf`.replace(/\s+/g, '-');
    
    html2canvas(element).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jspdf.jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(filename);
    });
  }
});