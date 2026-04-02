"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to send message");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    { icon: MapPin, title: "Visit Us", lines: ["15 Independence Ave", "Accra, Ghana"] },
    { icon: Phone, title: "Call Us", lines: ["+233 20 123 4567", "+233 30 123 4567"] },
    { icon: Mail, title: "Email Us", lines: ["info@tourkings.com", "bookings@tourkings.com"] },
    { icon: Clock, title: "Working Hours", lines: ["Mon - Fri: 8AM - 6PM", "Sat: 9AM - 3PM"] },
  ];

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-headline font-bold text-on-surface mb-4">
            Get in <span className="text-primary">Touch</span>
          </h1>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
            Have questions about our tours? Want a custom package? We&apos;d love to hear from you.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <FadeIn>
              <Card className="p-8">
                {submitted ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                    <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send size={28} className="text-secondary" />
                    </div>
                    <h3 className="text-2xl font-headline font-bold text-on-surface mb-2">Message Sent!</h3>
                    <p className="text-on-surface-variant">We&apos;ll get back to you within 24 hours.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <Input label="Your Name" id="name" placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                      <Input label="Email Address" id="email" type="email" placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                    </div>
                    <Input label="Subject" id="subject" placeholder="How can we help?" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required />
                    <div className="w-full">
                      <label htmlFor="message" className="block text-sm font-medium text-on-surface-variant mb-1.5">Message</label>
                      <textarea id="message" rows={6} placeholder="Tell us about your dream trip..." value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required
                        className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/15 rounded-lg text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none" />
                    </div>
                    <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting} className="w-full sm:w-auto">
                      <Send size={18} className="mr-2" /> Send Message
                    </Button>
                  </form>
                )}
              </Card>
            </FadeIn>
          </div>

          <div className="space-y-6">
            {contactInfo.map((info, i) => (
              <FadeIn key={info.title} delay={i * 0.1} direction="left">
                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <info.icon size={22} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-on-surface font-semibold mb-1">{info.title}</h3>
                      {info.lines.map((line) => (
                        <p key={line} className="text-on-surface-variant text-sm">{line}</p>
                      ))}
                    </div>
                  </div>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
