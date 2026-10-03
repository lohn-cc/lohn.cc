---
title: "Two projects I'm proud of: a research institute's website and a landfill weighbridge billing system"
description: "Fifteen years apart, both started with the same question: what does the person using this every day actually need? The Institut Pasteur du Laos website (WordPress, since 2011) and Landfill, a Lao/English weighing and billing system built with Flutter."
date: 2026-10-03
draft: false
slug: "pasteur-website-and-landfill-billing"
build:
  publishResources: false
---

People often ask what kind of work I do. The honest answer is "whatever keeps an organisation running" — networks, servers, hotel systems, medical equipment. But two projects stand out because I built them from the ground up to solve a real problem. One is a website I started in 2011. The other is a desktop application I built in 2025 that now runs a provincial landfill.

## 1. pasteur.la — the Institut Pasteur du Laos website (since 2011)

### The context

The [Institut Pasteur du Laos](https://www.pasteur.la/) is an international biomedical research institute in Vientiane. I joined in 2010 — first as Data Manager, then as IT Manager and Building Facility Manager — at a time when the institute was growing: a new BSL-2+ laboratory was under construction, and the institute's laboratories started operating in December 2011. It needed a public face that matched its work.

### What I did

- Led the development of the institute's official website on **WordPress** in 2011, including its **custom theme**, and its ongoing maintenance until 2015.
- Supervised the media creation specialist who produced the content and visual material.
- Set it up so that the people who own the content — researchers and administration — could publish news and updates without needing a developer for every change.

### Why WordPress

For an organisation whose core business is science, not software, the website platform had to be:

- **Easy to edit** by non-technical staff.
- **Widely supported**, so the institute would never depend on one person to keep it alive.
- **Extensible** as needs grew — new sections, new languages, new research units.

### Fifteen years later

The site is still running today on WordPress with the custom theme I built. It is bilingual (English and French) and covers research units, publications, news, annual reports, recruitment and donations — and the platform decision made in 2011 still holds.

{{< screenshot src="pasteur-la-2026.jpg" alt="The Institut Pasteur du Laos website homepage in 2026, with the institute's logo, building photo, navigation menu and the 'What is IPL?' page" caption="[pasteur.la](https://www.pasteur.la/) in 2026 — still on the WordPress platform and custom theme from 2011." >}}

### What I learned

- **Choose the platform for the people who will maintain it**, not for the person who builds it.
- **A website is a process, not a project.** Training editors and setting simple publishing habits mattered more than any feature.
- **Boring technology lasts.** A mainstream, well-supported platform outlived several redesigns.

## 2. Landfill — a weighbridge billing and management system (2025)

### The problem

At a landfill, every truck is a transaction: it is weighed, the waste type and customer are recorded, and a bill is produced — sometimes by weight, sometimes as a fixed price per load, sometimes on credit for regular customers. Done on paper or in spreadsheets, this is slow, error-prone and hard to audit.

### What I built

**Landfill** is a Windows desktop application developed by **[Vangera Systems](https://www.vangera.systems/)** that handles the whole flow from the weighbridge to the accounts. It is in use at the landfill site of the **Pakxan Urban Development and Administration Authority** in Bolikhamxay Province.

{{< screenshot src="landfill-login.png" alt="Landfill login screen showing the logo and name of the Pakxan Urban Development and Administration Authority landfill site, in Lao" caption="Sign-in screen, branded for the Pakxan Urban Development and Administration Authority landfill." >}}

What it does:

- **Live scale integration** — reads the weight directly from the weighing indicator over a serial connection, and copes with the different formats scales send (for example `+00000000B` or `90kg`).
- **Billing** — by weight and waste type, or price-per-load by vehicle type; a waiting list for trucks; bill cancellation with a mandatory comment.
- **Customers and vehicles** — customer records with contact people and their vehicles, with fast search by plate number.
- **Credit management** for account customers.
- **Accounting and reports** — date-range totals (week, month, year to date), exports to PDF, CSV and Excel.
- **Printing** on A4, A5 and thermal receipt printers.
- **Lao and English** throughout the interface.
- **Roles and control** — Super User, Manager and Officer roles, each with its own home screen; supervisor approval for sensitive operations; an audit log of important events.
- **Internal-use automation** — the system recognises the company's own vehicles and waste and applies the right payment method automatically.
- **Practice mode** — staff can train on realistic scenarios without touching real data.
- **Backup and restore** of the master data.

{{< screenshot src="landfill-billing.png" alt="Landfill billing screen in Lao: live scale reading, vehicle and customer selection, weight-in and weight-out fields, deductions, payment methods (cash, transfer, mixed, credit) and the waiting list" caption="The billing screen: live scale reading, weight in/out, deductions, payment method and the waiting list of trucks to be weighed out." >}}

{{< screenshot src="landfill-accounting.png" alt="Landfill accounting screen in Lao listing bills with plate number, waste type, weights, amount, payment method and status, with Excel export and print buttons" caption="Accounting: bills for a date range with weights, amounts and payment split, exportable to Excel and printable." >}}

### How it's built

- **Flutter** for the user interface, compiled as a native Windows application.
- **SQLite** with encryption for local data storage, and an automatic schema-migration system so upgrades don't lose data.
- **libserialport** for communication with the weighing scale.
- A single-instance lock so two copies of the program can never run at once on the same weighbridge PC.

### What I learned

- **Design for the operator at the weighbridge.** Big, clear screens and fast search mattered more than clever features.
- **Real hardware is messy.** Scales send data in different formats; parsing had to be tolerant, logged and tested.
- **Auditability is a feature.** Cancellations with comments, supervisor overrides and logs are what make the numbers trustworthy for management.
- **Training built into the software** (practice mode) reduces mistakes in the first weeks more than any manual.

## What connects the two

A research institute's website and a landfill billing system have little in common technically. What they share is the approach: understand who uses it every day, choose technology that can be maintained, and build it so the organisation can run without me standing next to it.

If you have a process that still runs on paper or spreadsheets — or a website that has become hard to keep up to date — I'd be glad to talk. You can reach me through the [contact form](/#contact) or via [Vangera Systems](https://www.vangera.systems/).
