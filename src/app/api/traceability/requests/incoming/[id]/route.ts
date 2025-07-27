import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  // Fetch traceability request details from the database
  const { data, error } = await supabase
    .from('trace_requests')
    .select(`
      id,
      requestingOrganizationId,
      targetOrganizationId,
      productIds,
      assessmentId,
      parentRequestId,
      status,
      priority,
      dueDate,
      message,
      cascadeSettings,
      createdAt,
      updatedAt,
      requesting_organization:organizations!requestingOrganizationId(*),
      target_organization:organizations!targetOrganizationId(*),
      products:products(*),
      assessment:assessments(*),
      responses:assessment_responses(traceRequestId, responseData, submittedAt, respondingOrganizationId, submittedByUserId)
    `)
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await req.json();

  // Update traceability request in the database
  const { data, error } = await supabase
    .from('trace_requests')
    .update(body)
    .eq('id', id)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  // Delete traceability request from the database
  const { error } = await supabase
    .from('trace_requests')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Traceability request deleted successfully' });
}