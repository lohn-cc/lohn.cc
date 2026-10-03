---
title: "Landfill: a Lao/English weighbridge billing system for a provincial landfill"
description: "How a desktop application built by Vangera Systems turns every truck at the Pakxan landfill into a clean, auditable transaction — from the scale reading to the printed receipt and the accounts."
date: 2026-10-03T10:00:00+07:00
draft: false
slug: "landfill-weighbridge-billing-system"
build:
  publishResources: false
---

At a landfill, every truck is a transaction. It drives onto the weighbridge full, unloads, drives back on empty — and the difference, the waste type and the customer decide what is billed. Done on paper or in spreadsheets, that is slow, error-prone and hard to audit.

**Landfill** is the Windows application I built through [Vangera Systems](https://www.vangera.systems/) to handle that whole flow. It is in use at the landfill site of the **Pakxan Urban Development and Administration Authority** in Bolikhamxay Province.

{{< screenshot src="landfill-login.png" alt="Landfill sign-in screen showing the logo and name of the Pakxan Urban Development and Administration Authority landfill site, in Lao" caption="Sign-in screen, branded for the Pakxan Urban Development and Administration Authority landfill." >}}

## A truck's journey through the system

The billing screen is where the operator spends the day. It follows the real sequence at the weighbridge:

1. **Identify the truck.** Search the registered vehicles by plate number, or register a new customer or vehicle on the spot.
2. **Weigh in.** The live reading from the electronic scale is shown at the top of the screen; one click (or **F1**) captures the loaded weight.
3. **Wait.** The truck goes onto the **waiting list** — bill number, plate, customer and weigh-in time — while it unloads.
4. **Weigh out.** The operator loads the truck back from the waiting list and captures the empty weight (**F2**).
5. **Calculate.** The waste weight is computed automatically. Deductions can be applied — general, moisture, special and impurities — to reach the chargeable net weight. The amount follows the rate for the waste type, or a fixed price per load for vehicle types billed that way.
6. **Pay.** Cash, bank transfer, a mix of both, or credit for account customers.
7. **Complete & print.** The receipt prints on **A5**, an **80 mm thermal printer** or **A4**. **F3** starts the next bill.

{{< screenshot src="landfill-billing-waiting-list.png" alt="Landfill billing screen in Lao: live scale reading, weight-in and weight-out fields, deduction fields for general, moisture, special and impurities, payment methods, and a waiting list with one truck" caption="The billing screen: live scale reading, weights, deductions, payment method, and the waiting list of trucks still to be weighed out." >}}

## Behind the counter

The rest of the system makes the numbers trustworthy for management:

- **Customers and vehicles** — customer records with contact people and their vehicles.
- **Credit management** for customers who pay on account.
- **Accounting** — bills for any date range (with one-click week, month and year to date), totals, and export to **Excel, CSV or PDF**, or a printed report.
- **Roles** — Super User, Manager and Officer, each with its own home screen and permissions.
- **Control** — supervisor approval for sensitive operations, a mandatory comment when a bill is cancelled, and an audit log of important events.
- **Internal use** — the system recognises the authority's own vehicles and waste and applies the right payment method automatically.
- **Practice mode** — new staff can train on realistic scenarios without touching real data.
- **Backup and restore** of the master data.
- **Lao and English** throughout, switchable at any time.

{{< screenshot src="landfill-accounting.png" alt="Landfill accounting screen in Lao listing bills with customer, plate number, waste type, weights, amount, payment method, amounts paid in cash and by transfer, status and date, with Excel export and print buttons" caption="Accounting: bills for a date range with weights, amounts and the cash/transfer split — exportable to Excel and printable." >}}

## How it's built

- **Flutter**, compiled as a native **Windows** desktop application.
- **SQLite** with encryption for local storage, plus an automatic schema-migration system so upgrades never lose data.
- **libserialport** to read the weighing indicator over a serial connection, with tolerant parsing of the formats scales send (for example `+00000000B` or `90kg`).
- A **single-instance lock**, so two copies of the program can never run at once on the weighbridge PC.

## What I learned

- **Design for the operator at the weighbridge.** Big, clear screens, keyboard shortcuts and fast plate search mattered more than clever features.
- **Real hardware is messy.** Scales send data in different formats; parsing had to be tolerant, logged and tested.
- **Auditability is a feature.** Cancellation comments, supervisor overrides and logs are what make the totals credible to management.
- **Training built into the software** — practice mode — prevents more mistakes in the first weeks than any manual.

---

Running a weighbridge, a counter or any process that still lives on paper and spreadsheets? [Vangera Systems](https://www.vangera.systems/) builds software around how your operation actually works. Get in touch through the [contact form](/#contact). You can also read about an older project of mine: [the Institut Pasteur du Laos website, on WordPress since 2011](/notes/pasteur-la-wordpress-since-2011/).
