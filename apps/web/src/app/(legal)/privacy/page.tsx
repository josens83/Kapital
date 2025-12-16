import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="text-primary hover:underline mb-8 inline-block">
          ← 홈으로 돌아가기
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">개인정보처리방침</h1>

        <div className="bg-white rounded-xl p-8 shadow-sm space-y-6">
          <p className="text-gray-500 text-sm">최종 수정일: 2025년 1월 1일</p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">1. 개인정보의 수집 및 이용 목적</h2>
            <p className="text-gray-600 leading-relaxed">
              Kapital(이하 "회사")은 다음의 목적을 위하여 개인정보를 처리합니다:
            </p>
            <ul className="text-gray-600 leading-relaxed list-disc pl-5 space-y-2">
              <li>회원 가입 및 관리: 회원제 서비스 제공, 본인 확인, 서비스 부정 이용 방지</li>
              <li>서비스 제공: 재무관리 서비스 제공, 맞춤형 서비스 제공</li>
              <li>서비스 개선: 신규 서비스 개발, 서비스 품질 향상</li>
              <li>고객 지원: 민원 처리, 공지사항 전달</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">2. 수집하는 개인정보 항목</h2>
            <p className="text-gray-600 leading-relaxed">
              회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다:
            </p>
            <ul className="text-gray-600 leading-relaxed list-disc pl-5 space-y-2">
              <li><strong>필수 항목:</strong> 이메일 주소, 비밀번호, 이름</li>
              <li><strong>선택 항목:</strong> 프로필 사진, 전화번호</li>
              <li><strong>자동 수집 항목:</strong> 접속 IP, 기기 정보, 서비스 이용 기록</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">3. 개인정보의 보유 및 이용 기간</h2>
            <p className="text-gray-600 leading-relaxed">
              회사는 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.
              단, 관계 법령에 따라 보존할 필요가 있는 경우 해당 기간 동안 보관합니다:
            </p>
            <ul className="text-gray-600 leading-relaxed list-disc pl-5 space-y-2">
              <li>계약 또는 청약 철회 등에 관한 기록: 5년</li>
              <li>대금 결제 및 재화 등의 공급에 관한 기록: 5년</li>
              <li>소비자의 불만 또는 분쟁 처리에 관한 기록: 3년</li>
              <li>접속 기록: 3개월</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">4. 개인정보의 제3자 제공</h2>
            <p className="text-gray-600 leading-relaxed">
              회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.
              다만, 다음의 경우에는 예외로 합니다:
            </p>
            <ul className="text-gray-600 leading-relaxed list-disc pl-5 space-y-2">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 요청이 있는 경우</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">5. 개인정보의 안전성 확보 조치</h2>
            <p className="text-gray-600 leading-relaxed">
              회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:
            </p>
            <ul className="text-gray-600 leading-relaxed list-disc pl-5 space-y-2">
              <li>개인정보 암호화: AES-256 암호화 적용</li>
              <li>해킹 등에 대비한 기술적 대책: SSL/TLS 보안 통신, 방화벽 운영</li>
              <li>개인정보 취급 직원의 최소화 및 교육</li>
              <li>정기적인 자체 감사 실시</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">6. 이용자의 권리와 행사 방법</h2>
            <p className="text-gray-600 leading-relaxed">
              이용자는 언제든지 다음과 같은 권리를 행사할 수 있습니다:
            </p>
            <ul className="text-gray-600 leading-relaxed list-disc pl-5 space-y-2">
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리정지 요구</li>
            </ul>
            <p className="text-gray-600 leading-relaxed">
              위 권리 행사는 설정 메뉴 또는 고객센터를 통해 가능합니다.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">7. 쿠키의 사용</h2>
            <p className="text-gray-600 leading-relaxed">
              회사는 이용자에게 개별적인 맞춤 서비스를 제공하기 위해 쿠키(Cookie)를 사용합니다.
              이용자는 웹브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 서비스
              이용에 어려움이 있을 수 있습니다.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">8. 개인정보 보호책임자</h2>
            <p className="text-gray-600 leading-relaxed">
              회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한
              정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를
              지정하고 있습니다:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600">
                <strong>개인정보 보호책임자</strong><br />
                이름: 홍길동<br />
                이메일: privacy@kapital.app<br />
                전화: 02-1234-5678
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">9. 개인정보처리방침 변경</h2>
            <p className="text-gray-600 leading-relaxed">
              이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경 내용의
              추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을
              통하여 고지할 것입니다.
            </p>
          </section>

          <div className="pt-6 border-t">
            <p className="text-gray-500 text-sm">
              본 개인정보처리방침은 2025년 1월 1일부터 시행됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
