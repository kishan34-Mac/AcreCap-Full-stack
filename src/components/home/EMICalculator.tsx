import { useState, useMemo } from 'react';
import { Calculator, IndianRupee, Calendar, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Link } from 'react-router-dom';

export const EMICalculator = () => {
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [interestRate, setInterestRate] = useState(10);
  const [tenure, setTenure] = useState(24);

  const calculations = useMemo(() => {
    const principal = loanAmount;
    const monthlyRate = interestRate / 12 / 100;
    const months = tenure;

    // EMI Formula: P × r × (1 + r)^n / ((1 + r)^n - 1)
    const emi =
      monthlyRate === 0
        ? principal / months
        : (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
          (Math.pow(1 + monthlyRate, months) - 1);

    const totalAmount = emi * months;
    const totalInterest = totalAmount - principal;

    return {
      emi: Math.round(emi),
      totalAmount: Math.round(totalAmount),
      totalInterest: Math.round(totalInterest),
      principal,
    };
  }, [loanAmount, interestRate, tenure]);

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const principalPercentage = (calculations.principal / calculations.totalAmount) * 100;
  const interestPercentage = (calculations.totalInterest / calculations.totalAmount) * 100;

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-semibold mb-4">
            Financial Tools
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            EMI <span className="text-primary">Calculator</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Plan your loan repayments with our easy-to-use EMI calculator. Get instant estimates for your monthly installments.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Calculator Controls */}
            <div className="glass-card rounded-3xl p-8 space-y-8">
              {/* Loan Amount */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <IndianRupee className="w-4 h-4 text-primary" />
                    Loan Amount
                  </label>
                  <span className="text-lg font-bold text-primary">{formatCurrency(loanAmount)}</span>
                </div>
                <Slider
                  value={[loanAmount]}
                  onValueChange={(value) => setLoanAmount(value[0])}
                  min={100000}
                  max={10000000}
                  step={50000}
                  className="w-full"
                />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>₹1L</span>
                  <span>₹1Cr</span>
                </div>
              </div>

              {/* Interest Rate */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Percent className="w-4 h-4 text-primary" />
                    Interest Rate (p.a.)
                  </label>
                  <span className="text-lg font-bold text-primary">{interestRate}%</span>
                </div>
                <Slider
                  value={[interestRate]}
                  onValueChange={(value) => setInterestRate(value[0])}
                  min={5}
                  max={25}
                  step={0.5}
                  className="w-full"
                />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>5%</span>
                  <span>25%</span>
                </div>
              </div>

              {/* Tenure */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Calendar className="w-4 h-4 text-primary" />
                    Loan Tenure
                  </label>
                  <span className="text-lg font-bold text-primary">{tenure} Months</span>
                </div>
                <Slider
                  value={[tenure]}
                  onValueChange={(value) => setTenure(value[0])}
                  min={6}
                  max={84}
                  step={6}
                  className="w-full"
                />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>6 Months</span>
                  <span>7 Years</span>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="glass-card rounded-3xl p-8 flex flex-col">
              {/* EMI Display */}
              <div className="text-center mb-8 pb-8 border-b border-border/50">
                <p className="text-sm text-muted-foreground mb-2">Monthly EMI</p>
                <div className="flex items-center justify-center gap-2">
                  <Calculator className="w-8 h-8 text-primary" />
                  <span className="text-4xl md:text-5xl font-bold text-foreground">
                    {formatCurrency(calculations.emi)}
                  </span>
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center p-4 rounded-xl bg-secondary/50">
                  <span className="text-muted-foreground">Principal Amount</span>
                  <span className="font-semibold text-foreground">{formatCurrency(calculations.principal)}</span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-xl bg-secondary/50">
                  <span className="text-muted-foreground">Total Interest</span>
                  <span className="font-semibold text-accent">{formatCurrency(calculations.totalInterest)}</span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-xl bg-primary/10">
                  <span className="font-semibold text-foreground">Total Amount</span>
                  <span className="font-bold text-primary text-lg">{formatCurrency(calculations.totalAmount)}</span>
                </div>
              </div>

              {/* Visual Breakdown */}
              <div className="mb-8">
                <div className="h-4 rounded-full overflow-hidden bg-secondary flex">
                  <div
                    className="bg-primary transition-all duration-500"
                    style={{ width: `${principalPercentage}%` }}
                  />
                  <div
                    className="bg-accent transition-all duration-500"
                    style={{ width: `${interestPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary" />
                    Principal ({principalPercentage.toFixed(0)}%)
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-accent" />
                    Interest ({interestPercentage.toFixed(0)}%)
                  </span>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-auto">
                <Button variant="accent" size="lg" className="w-full" asChild>
                  <Link to="/apply">Apply for Loan Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
