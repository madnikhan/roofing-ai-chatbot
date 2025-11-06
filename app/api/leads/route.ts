import { NextRequest, NextResponse } from 'next/server';
import { getLeads, saveLead, updateLead, deleteLead } from '@/lib/database';
import { Lead } from '@/types';
import { generateId } from '@/lib/utils';

// GET - Fetch all leads
export async function GET() {
  try {
    const leads = await getLeads();
    return NextResponse.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

// POST - Create a new lead or update existing one
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Check if lead already exists (by phone or email)
    const existingLeads = await getLeads();
    const existingLead = existingLeads.find(
      (lead) => lead.phone === data.phone || (data.email && lead.email === data.email)
    );

    let lead: Lead;
    let isUpdate = false;

    if (existingLead) {
      // Update existing lead with new information
      isUpdate = true;
      lead = {
        ...existingLead,
        name: data.name || existingLead.name,
        address: data.address || existingLead.address,
        problem: data.problem || existingLead.problem,
        emergencyLevel: data.emergencyLevel || existingLead.emergencyLevel,
        status: data.status || existingLead.status,
        preferredContact: data.preferredContact || existingLead.preferredContact,
        availability: data.availability || existingLead.availability,
        scheduledTime: data.scheduledTime || existingLead.scheduledTime,
        email: data.email || existingLead.email,
        city: data.city || existingLead.city,
        state: data.state || existingLead.state,
        zipCode: data.zipCode || existingLead.zipCode,
        propertyType: data.propertyType || existingLead.propertyType,
        preferredTime: data.preferredTime || existingLead.preferredTime,
      };

      await updateLead(existingLead.id, lead);
    } else {
      // Create new lead
      lead = {
        id: generateId(),
        name: data.name,
        phone: data.phone,
        address: data.address,
        problem: data.problem,
        emergencyLevel: data.emergencyLevel || 1,
        status: data.status || 'new',
        preferredContact: data.preferredContact || 'phone',
        availability: data.availability,
        scheduledTime: data.scheduledTime,
        email: data.email,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        propertyType: data.propertyType,
        preferredTime: data.preferredTime,
        createdAt: new Date(),
      };

      await saveLead(lead);
    }

    return NextResponse.json(lead, { status: isUpdate ? 200 : 201 });
  } catch (error) {
    console.error('Error saving lead:', error);
    return NextResponse.json(
      { error: 'Failed to save lead' },
      { status: 500 }
    );
  }
}

// PUT - Update a lead
export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    await updateLead(id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a lead
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    await deleteLead(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
}

