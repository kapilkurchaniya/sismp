import { NextResponse } from 'next/server';
import { MeetingRequestStore, MeetingRequestRecord } from '@/lib/server/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const applicantId = searchParams.get('applicantId');

    const allRequests = await MeetingRequestStore.getAll();
    if (applicantId) {
      const data = allRequests.filter((m: any) => m.registrationId === applicantId || m.applicantId === applicantId || m.officerId === applicantId);
      return NextResponse.json({ success: true, data });
    }
    return NextResponse.json({ success: true, data: allRequests });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { applicantId, applicantName, companyName, sector, durationMins, officerId, officerName, departmentName, requestedDate, timeSlot } = body;

    if (!applicantId || !sector) {
      return NextResponse.json({ success: false, error: 'applicantId and sector are required.' }, { status: 400 });
    }

    const newReq: MeetingRequestRecord = {
      id: `meet-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      applicantId,
      applicantName: applicantName || 'Unknown',
      companyName: companyName || 'Unknown Company',
      sector,
      durationMins: durationMins ? Number(durationMins) : 30,
      requestDate: new Date().toISOString(),
      status: (officerId && String(officerId).startsWith('IMP')) ? 'Pending_Peer_Acceptance' : (officerName ? 'Requested' : 'Pending'), // P2P meetings wait for peer acceptance
      
      // P2P Fields
      officerId,
      officerName,
      departmentName,
      requestedDate,
      timeSlot
    };

    const saved = await MeetingRequestStore.insert(newReq);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, scheduledTime, meetingLink, roomId, roomName } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'id and status are required' }, { status: 400 });
    }

    const updates: any = { status };
    if (scheduledTime) updates.scheduledTime = scheduledTime;
    if (roomId) updates.roomId = roomId;
    if (roomName) updates.roomName = roomName;
    if (meetingLink) updates.meetingLink = meetingLink;

    const updated = await MeetingRequestStore.update(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
