import { ChangeDetectorRef, Component } from '@angular/core';
import { CustomerService } from '../../services/customer.service';
import { Customer, Transaction } from '../../models/customer.model';
@Component({
  selector: 'app-customer-table',
  templateUrl: './customer-table.component.html',
  styleUrl: './customer-table.component.scss',
})
export class CustomerTableComponent {

  customers: Customer[] = [];
  transactions: Transaction[] = [];
  customerTransactions:any[] = [] 
  loading: boolean = true;
  selectedCustomer: any = {};
  chartOptions: any;
  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    
    this.customerService.getCustomers().subscribe(data => {
      this.customers = data;
      this.loading = false;
    });

    this.customerService.getTransactions().subscribe(data => {
      this.transactions = data;
    });
    this.mergeArrays()
    this.updateChart();
  }

  mergeArrays() {
    this.customerTransactions = this.customers.flatMap((customer) => {
      return this.transactions
        .filter((transaction) => transaction.customer_id == customer.id)
        .map((transaction) => ({
          Id: customer.id,
          Name: customer.name,
          Date: transaction.date,
          Amount: transaction.amount,
        }));
    });
  }
  
  updateChart() {
    const transactions = this.customerTransactions.filter(t => t.Id === this.selectedCustomer.id);
    const groupedTransactions: { [key: string]: number } = transactions.reduce((acc: { [key: string]: number }, transaction) => {
      acc[transaction.Date] = (acc[transaction.Date] || 0) + transaction.Amount;
      return acc;
    }, {});
    const dataPoints = Object.keys(groupedTransactions).map(date => ({
      x: new Date(date),
      y: groupedTransactions[date]
    }));

    this.chartOptions = {
      animationEnabled: true,
      theme: "light2",
      title: {
        text: "Total Transaction Amount Per Day"
      },
      axisX: {
        title: "Date",
        valueFormatString: "YYYY-MM-DD"
      },
      axisY: {
        title: "Amount",
        includeZero: false
      },
      data: [{
        type: "line",
        dataPoints: dataPoints
      }]
    };
  }
}
