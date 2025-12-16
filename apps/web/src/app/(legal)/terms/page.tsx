import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="text-primary hover:underline mb-8 inline-block">
          ← 홈으로 돌아가기
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">이용약관</h1>

        <div className="bg-white rounded-xl p-8 shadow-sm space-y-6">
          <p className="text-gray-500 text-sm">최종 수정일: 2025년 1월 1일</p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">제1조 (목적)</h2>
            <p className="text-gray-600 leading-relaxed">
              이 약관은 Kapital(이하 "회사")이 제공하는 개인 재무관리 서비스(이하 "서비스")의
              이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을
              규정함을 목적으로 합니다.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">제2조 (정의)</h2>
            <ul className="text-gray-600 leading-relaxed list-disc pl-5 space-y-2">
              <li>"서비스"란 회사가 제공하는 복식부기 기반 개인 재무관리 앱 및 관련 서비스를 의미합니다.</li>
              <li>"이용자"란 이 약관에 따라 서비스를 이용하는 회원을 의미합니다.</li>
              <li>"계정"이란 이용자가 서비스에 접속하기 위해 생성한 아이디와 비밀번호를 의미합니다.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">제3조 (서비스 제공)</h2>
            <p className="text-gray-600 leading-relaxed">
              회사는 다음과 같은 서비스를 제공합니다:
            </p>
            <ul className="text-gray-600 leading-relaxed list-disc pl-5 space-y-2">
              <li>복식부기 기반 거래 기록 및 관리</li>
              <li>예산 설정 및 지출 추적</li>
              <li>재무제표 및 리포트 생성</li>
              <li>데이터 백업 및 내보내기</li>
              <li>기타 재무관리 관련 기능</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">제4조 (회원가입)</h2>
            <p className="text-gray-600 leading-relaxed">
              이용자는 회사가 정한 절차에 따라 회원가입을 신청하고, 회사가 이를 승인함으로써
              회원자격을 취득합니다. 회사는 다음 각 호에 해당하는 경우 가입을 거부할 수 있습니다:
            </p>
            <ul className="text-gray-600 leading-relaxed list-disc pl-5 space-y-2">
              <li>실명이 아니거나 타인의 정보를 도용한 경우</li>
              <li>허위 정보를 기재하거나 필수 정보를 제공하지 않은 경우</li>
              <li>이전에 약관 위반으로 자격이 상실된 경우</li>
              <li>만 14세 미만인 경우</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">제5조 (유료 서비스)</h2>
            <p className="text-gray-600 leading-relaxed">
              회사는 기본 무료 서비스 외에 유료 구독 서비스를 제공합니다. 유료 서비스의
              이용 요금, 결제 방법, 환불 정책 등은 별도의 페이지에서 안내합니다.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">제6조 (이용자의 의무)</h2>
            <p className="text-gray-600 leading-relaxed">
              이용자는 다음 행위를 해서는 안 됩니다:
            </p>
            <ul className="text-gray-600 leading-relaxed list-disc pl-5 space-y-2">
              <li>허위 정보 등록</li>
              <li>타인의 정보 도용</li>
              <li>서비스의 정상적인 운영을 방해하는 행위</li>
              <li>회사의 지적재산권 침해</li>
              <li>기타 관계 법령에 위배되는 행위</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">제7조 (책임의 제한)</h2>
            <p className="text-gray-600 leading-relaxed">
              회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중단 등 불가항력적인 사유로
              서비스를 제공할 수 없는 경우 책임이 면제됩니다. 회사는 이용자의 귀책사유로
              인한 서비스 이용 장애에 대해 책임을 지지 않습니다.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">제8조 (분쟁 해결)</h2>
            <p className="text-gray-600 leading-relaxed">
              이 약관에 명시되지 않은 사항은 관계 법령 및 상관례에 따릅니다.
              서비스 이용과 관련하여 분쟁이 발생한 경우, 양 당사자는 원만한 해결을 위해
              성실히 협의합니다.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">제9조 (약관의 변경)</h2>
            <p className="text-gray-600 leading-relaxed">
              회사는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지 또는
              이메일을 통해 안내합니다. 이용자가 변경된 약관에 동의하지 않는 경우 서비스
              이용을 중단하고 탈퇴할 수 있습니다.
            </p>
          </section>

          <div className="pt-6 border-t">
            <p className="text-gray-500 text-sm">
              본 약관은 2025년 1월 1일부터 시행됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
